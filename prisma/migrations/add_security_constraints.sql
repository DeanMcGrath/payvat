-- Production Security Migration
-- Adds database constraints to enforce data isolation
-- Run this migration before going live

-- Add NOT NULL constraints for user associations
ALTER TABLE vat_documents 
ADD CONSTRAINT documents_must_have_user 
CHECK (userId IS NOT NULL);

ALTER TABLE vat_returns 
ADD CONSTRAINT returns_must_have_user 
CHECK (userId IS NOT NULL);

ALTER TABLE vat_payments 
ADD CONSTRAINT payments_must_have_user 
CHECK (userId IS NOT NULL);

-- Add indexes for performance and security queries
CREATE INDEX IF NOT EXISTS idx_documents_user_created 
ON vat_documents(userId, uploadedAt DESC);

CREATE INDEX IF NOT EXISTS idx_documents_scanned_user 
ON vat_documents(isScanned, userId, uploadedAt DESC);

CREATE INDEX IF NOT EXISTS idx_documents_guest_recent 
ON vat_documents(uploadedAt DESC) 
WHERE userId IN (SELECT id FROM vat_users WHERE role = 'GUEST');

CREATE INDEX IF NOT EXISTS idx_vatreturns_user_period 
ON vat_returns(userId, periodStart, periodEnd);

CREATE INDEX IF NOT EXISTS idx_payments_user_status 
ON vat_payments(userId, status, createdAt DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_action 
ON vat_audit_logs(userId, action, createdAt DESC);

CREATE INDEX IF NOT EXISTS idx_users_role_created 
ON vat_users(role, createdAt);

-- Add audit trigger for security monitoring
CREATE OR REPLACE FUNCTION log_document_access()
RETURNS TRIGGER AS $$
BEGIN
    -- Log when documents are accessed (for security monitoring)
    INSERT INTO vat_audit_logs (
        userId, 
        action, 
        entityType, 
        entityId, 
        ipAddress, 
        metadata, 
        createdAt
    ) VALUES (
        NEW.userId,
        'DOCUMENT_ACCESSED',
        'DOCUMENT',
        NEW.id,
        COALESCE(current_setting('app.client_ip', true), 'unknown'),
        jsonb_build_object(
            'fileName', NEW.originalName,
            'category', NEW.category,
            'fileSize', NEW.fileSize
        ),
        NOW()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Only create trigger if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'audit_document_access'
    ) THEN
        CREATE TRIGGER audit_document_access
        AFTER INSERT ON vat_documents
        FOR EACH ROW
        EXECUTE FUNCTION log_document_access();
    END IF;
END $$;

-- Add data retention columns
ALTER TABLE vat_documents 
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS retention_until TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS encryption_key_id VARCHAR(255) NULL;

-- Add guest user cleanup function
CREATE OR REPLACE FUNCTION cleanup_guest_users(older_than_hours INTEGER DEFAULT 24)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER := 0;
    guest_user RECORD;
    cutoff_time TIMESTAMP;
BEGIN
    cutoff_time := NOW() - (older_than_hours || ' hours')::INTERVAL;
    
    -- Find guest users older than specified hours
    FOR guest_user IN 
        SELECT id FROM vat_users 
        WHERE role = 'GUEST' 
        AND createdAt < cutoff_time
    LOOP
        -- Delete user's documents
        DELETE FROM vat_documents WHERE userId = guest_user.id;
        
        -- Delete user's audit logs
        DELETE FROM vat_audit_logs WHERE userId = guest_user.id;
        
        -- Delete user
        DELETE FROM vat_users WHERE id = guest_user.id;
        
        deleted_count := deleted_count + 1;
    END LOOP;
    
    -- Log cleanup activity
    INSERT INTO vat_audit_logs (
        action, 
        entityType, 
        metadata, 
        createdAt
    ) VALUES (
        'GUEST_CLEANUP',
        'SYSTEM',
        jsonb_build_object(
            'deletedGuestUsers', deleted_count,
            'olderThanHours', older_than_hours,
            'cutoffTime', cutoff_time
        ),
        NOW()
    );
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Add function to validate data consistency
CREATE OR REPLACE FUNCTION validate_document_consistency(user_id_param TEXT DEFAULT NULL)
RETURNS TABLE(
    user_id TEXT,
    total_documents BIGINT,
    scanned_documents BIGINT,
    has_inconsistency BOOLEAN
) AS $$
BEGIN
    IF user_id_param IS NOT NULL THEN
        -- Check specific user
        RETURN QUERY
        SELECT 
            user_id_param::TEXT,
            COUNT(*)::BIGINT as total_docs,
            COUNT(*) FILTER (WHERE isScanned = true)::BIGINT as scanned_docs,
            (COUNT(*) FILTER (WHERE isScanned = true) > COUNT(*))::BOOLEAN as inconsistent
        FROM vat_documents 
        WHERE userId = user_id_param;
    ELSE
        -- Check all users
        RETURN QUERY
        SELECT 
            d.userId::TEXT,
            COUNT(*)::BIGINT as total_docs,
            COUNT(*) FILTER (WHERE isScanned = true)::BIGINT as scanned_docs,
            (COUNT(*) FILTER (WHERE isScanned = true) > COUNT(*))::BOOLEAN as inconsistent
        FROM vat_documents d
        GROUP BY d.userId;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Add Row Level Security (RLS) policies
ALTER TABLE vat_documents ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own documents
CREATE POLICY user_documents_policy ON vat_documents
FOR ALL TO authenticated_users
USING (userId = current_setting('app.current_user_id', true)::TEXT);

-- Policy: Guest users can see recent guest documents
CREATE POLICY guest_documents_policy ON vat_documents
FOR SELECT TO anonymous_users
USING (
    userId IN (
        SELECT id FROM vat_users 
        WHERE role = 'GUEST' 
        AND createdAt > NOW() - INTERVAL '24 hours'
    )
);

-- Admin bypass policy
CREATE POLICY admin_documents_policy ON vat_documents
FOR ALL TO admin_users
USING (true);

-- Create security monitoring view
CREATE OR REPLACE VIEW security_monitoring AS
SELECT 
    DATE_TRUNC('hour', createdAt) as hour,
    action,
    COUNT(*) as event_count,
    COUNT(DISTINCT userId) as unique_users,
    COUNT(*) FILTER (WHERE action LIKE '%VIOLATION%') as violations
FROM vat_audit_logs
WHERE createdAt > NOW() - INTERVAL '24 hours'
GROUP BY DATE_TRUNC('hour', createdAt), action
ORDER BY hour DESC, violations DESC;

-- Grant appropriate permissions
GRANT SELECT ON security_monitoring TO admin_users;
GRANT EXECUTE ON FUNCTION cleanup_guest_users TO admin_users;
GRANT EXECUTE ON FUNCTION validate_document_consistency TO admin_users;

COMMENT ON FUNCTION cleanup_guest_users IS 'Removes guest users and their data older than specified hours';
COMMENT ON FUNCTION validate_document_consistency IS 'Validates document count consistency to prevent ghost document bugs';
COMMENT ON VIEW security_monitoring IS 'Real-time security event monitoring for administrators';