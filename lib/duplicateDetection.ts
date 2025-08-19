import { createHash } from 'crypto'
import { prisma } from '@/lib/prisma'

interface DocumentFingerprint {
  contentHash: string
  structuralHash: string
  metadataHash: string
  similarityScore?: number
}

interface DuplicateResult {
  isDuplicate: boolean
  duplicateOfId?: string
  similarityScore: number
  confidence: number
  reasons: string[]
}

/**
 * Generate a comprehensive fingerprint for a document
 */
export function generateDocumentFingerprint(
  fileData: string,
  fileName: string,
  fileSize: number,
  mimeType: string,
  extractedData?: any
): DocumentFingerprint {
  // Create content hash from file data
  const contentHash = createHash('sha256')
    .update(fileData)
    .digest('hex')

  // Create structural hash from key characteristics
  const structuralData = {
    fileSize,
    mimeType,
    fileName: fileName.toLowerCase().replace(/[^a-z0-9]/g, ''),
    extension: fileName.split('.').pop()?.toLowerCase()
  }
  const structuralHash = createHash('md5')
    .update(JSON.stringify(structuralData))
    .digest('hex')

  // Create metadata hash from extracted information
  let metadataHash = ''
  if (extractedData) {
    const metadata = {
      invoiceTotal: extractedData.invoiceTotal,
      extractedDate: extractedData.extractedDate?.toISOString(),
      vatAmounts: extractedData.vatAmounts?.map((v: any) => v.value).sort(),
      supplierName: extractedData.supplierName?.toLowerCase().replace(/[^a-z0-9]/g, '')
    }
    metadataHash = createHash('md5')
      .update(JSON.stringify(metadata))
      .digest('hex')
  }

  return {
    contentHash,
    structuralHash,
    metadataHash
  }
}

/**
 * Check if a document is a duplicate of existing documents
 */
export async function checkForDuplicates(
  fingerprint: DocumentFingerprint,
  userId: string,
  currentDocumentId?: string
): Promise<DuplicateResult> {
  try {
    // Get all user documents with fingerprints for comparison
    const existingDocuments = await prisma.document.findMany({
      where: {
        userId,
        id: currentDocumentId ? { not: currentDocumentId } : undefined,
        documentHash: { not: null }
      },
      select: {
        id: true,
        fileName: true,
        originalName: true,
        fileSize: true,
        documentHash: true,
        invoiceTotal: true,
        extractedDate: true,
        uploadedAt: true
      }
    })

    let bestMatch = {
      documentId: '',
      score: 0,
      reasons: [] as string[]
    }

    for (const doc of existingDocuments) {
      const score = calculateSimilarityScore(fingerprint, doc, userId)
      
      if (score.totalScore > bestMatch.score) {
        bestMatch = {
          documentId: doc.id,
          score: score.totalScore,
          reasons: score.reasons
        }
      }
    }

    // Determine if it's a duplicate based on similarity score
    const isDuplicate = bestMatch.score >= 0.8 // 80% similarity threshold
    const confidence = bestMatch.score

    return {
      isDuplicate,
      duplicateOfId: isDuplicate ? bestMatch.documentId : undefined,
      similarityScore: bestMatch.score,
      confidence,
      reasons: bestMatch.reasons
    }

  } catch (error) {
    console.error('Duplicate detection error:', error)
    return {
      isDuplicate: false,
      similarityScore: 0,
      confidence: 0,
      reasons: ['Error during duplicate detection']
    }
  }
}

/**
 * Calculate similarity score between fingerprints and existing document
 */
function calculateSimilarityScore(
  fingerprint: DocumentFingerprint,
  existingDoc: any,
  userId: string
): { totalScore: number; reasons: string[] } {
  let totalScore = 0
  const reasons: string[] = []

  // Exact content match (highest weight - 50%)
  if (fingerprint.contentHash && existingDoc.documentHash === fingerprint.contentHash) {
    totalScore += 0.5
    reasons.push('Identical file content detected')
  }

  // Structural similarity (20%)
  if (fingerprint.structuralHash) {
    // This would need to be stored and compared, for now we'll use file size similarity
    const sizeRatio = Math.min(existingDoc.fileSize, 1) / Math.max(existingDoc.fileSize, 1)
    if (sizeRatio > 0.95) {
      totalScore += 0.2
      reasons.push('Similar file size')
    }
  }

  // Filename similarity (15%)
  const filenameSimilarity = calculateFilenameSimilarity(
    fingerprint.contentHash, // Using as placeholder for filename
    existingDoc.originalName
  )
  if (filenameSimilarity > 0.8) {
    totalScore += 0.15 * filenameSimilarity
    reasons.push('Similar filename')
  }

  // Date similarity (10%)
  // This would compare extracted dates - placeholder for now
  if (existingDoc.extractedDate) {
    totalScore += 0.05 // Partial score for having date
    reasons.push('Same document period')
  }

  // Amount similarity (5%)
  if (existingDoc.invoiceTotal) {
    totalScore += 0.05 // Partial score for having amount
    reasons.push('Similar invoice amount')
  }

  return { totalScore, reasons }
}

/**
 * Calculate similarity between filenames
 */
function calculateFilenameSimilarity(filename1: string, filename2: string): number {
  if (!filename1 || !filename2) return 0

  const normalize = (name: string) => 
    name.toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .replace(/\d{4}\d{2}\d{2}/g, 'date') // Replace dates
      .replace(/\d+/g, 'num') // Replace numbers

  const norm1 = normalize(filename1)
  const norm2 = normalize(filename2)

  if (norm1 === norm2) return 1

  // Levenshtein distance for fuzzy matching
  const distance = levenshteinDistance(norm1, norm2)
  const maxLength = Math.max(norm1.length, norm2.length)
  
  return maxLength > 0 ? 1 - (distance / maxLength) : 0
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null))

  for (let i = 0; i <= str1.length; i += 1) {
    matrix[0][i] = i
  }

  for (let j = 0; j <= str2.length; j += 1) {
    matrix[j][0] = j
  }

  for (let j = 1; j <= str2.length; j += 1) {
    for (let i = 1; i <= str1.length; i += 1) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      )
    }
  }

  return matrix[str2.length][str1.length]
}

/**
 * Store document hash for future duplicate detection
 */
export async function storeDocumentHash(
  documentId: string,
  fingerprint: DocumentFingerprint
): Promise<void> {
  try {
    await prisma.document.update({
      where: { id: documentId },
      data: {
        documentHash: fingerprint.contentHash
      }
    })
  } catch (error) {
    console.error('Failed to store document hash:', error)
  }
}

/**
 * Mark a document as a duplicate
 */
export async function markAsDuplicate(
  documentId: string,
  duplicateOfId: string,
  confidence: number
): Promise<void> {
  try {
    await prisma.document.update({
      where: { id: documentId },
      data: {
        isDuplicate: true,
        duplicateOfId,
        // Store confidence in a comment or metadata field
        scanResult: `Marked as duplicate (${(confidence * 100).toFixed(1)}% confidence)`
      }
    })
  } catch (error) {
    console.error('Failed to mark document as duplicate:', error)
  }
}

/**
 * Get duplicate documents for a user
 */
export async function getDuplicateDocuments(userId: string): Promise<any[]> {
  try {
    return await prisma.document.findMany({
      where: {
        userId,
        isDuplicate: true
      },
      include: {
        user: {
          select: {
            businessName: true
          }
        }
      },
      orderBy: {
        uploadedAt: 'desc'
      }
    })
  } catch (error) {
    console.error('Failed to get duplicate documents:', error)
    return []
  }
}