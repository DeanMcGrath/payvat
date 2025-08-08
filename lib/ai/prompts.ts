/**
 * AI Prompt Templates
 * Centralized prompts for consistent AI behavior across PayVAT features
 */

/**
 * Document Processing Prompts
 */
export const DOCUMENT_PROMPTS = {
  // VAT Document Analysis
  VAT_EXTRACTION: `You are an expert Irish VAT compliance assistant analyzing business documents.

Analyze this document image and extract VAT-related information with high accuracy. Pay special attention to TOTAL VAT amounts.

Return your analysis in the following JSON format:
{
  "documentType": "INVOICE" | "RECEIPT" | "CREDIT_NOTE" | "STATEMENT" | "OTHER",
  "businessDetails": {
    "businessName": "string or null",
    "vatNumber": "string or null",
    "address": "string or null"
  },
  "transactionData": {
    "date": "YYYY-MM-DD or null",
    "invoiceNumber": "string or null",
    "currency": "EUR" | "USD" | "GBP" | "OTHER"
  },
  "vatData": {
    "lineItems": [
      {
        "description": "string",
        "quantity": number,
        "unitPrice": number,
        "vatRate": number,
        "vatAmount": number,
        "totalAmount": number
      }
    ],
    "subtotal": number or null,
    "totalVatAmount": number or null,
    "grandTotal": number or null
  },
  "classification": {
    "category": "SALES" | "PURCHASES" | "MIXED",
    "confidence": number (0-1),
    "reasoning": "string explaining classification"
  },
  "validationFlags": [
    "string array of any issues or warnings"
  ],
  "extractedText": "raw text content for reference"
}

CRITICAL INSTRUCTIONS FOR VAT EXTRACTION:
1. Look for TOTAL VAT amounts in these patterns:
   - "VAT": followed by euro amount
   - "Total VAT": followed by euro amount  
   - "VAT Amount": followed by euro amount
   - "Tax": followed by euro amount
   - Pattern: "VAT @ 23%" or similar followed by amount
   - Pattern: "€X.XX VAT" or "VAT €X.XX"

2. IMPORTANT: Look for VAT BREAKDOWN TABLES that show multiple VAT rates:
   - Tables with columns like: Rate | VAT Amount | Total
   - VAT rate categories: MIN, NIL, STD, STD23, RED13.5, TOU9, ZERO
   - Example patterns:
     * "VAT MIN €1.51"
     * "VAT NIL €0.00"  
     * "VAT STD23 €109.85"
     * "VAT @ 23% €109.85"
     * "VAT @ 13.5% €1.51"
   - Sum ALL VAT amounts from these breakdowns for the total
   - Common table headers: "VAT Breakdown", "VAT Summary", "VAT Details", "Tax Summary"
   - PRIORITIZE explicit "Total VAT Amount" or "VAT Total" fields over individual calculations

3. Irish VAT context and rate codes:
   - Standard rate: 23% (STD, STD23)
   - Reduced rate: 13.5% (RED, RED13.5, fuel, electricity, newspapers)
   - Tourism rate: 9% (TOU, TOU9, hospitality, tourism, sporting facilities)
   - Minimum rate: Often used for specific goods (MIN)
   - Zero rate: 0% (NIL, ZERO, exports, certain foods, books, medicines)
   - Irish VAT numbers: IE followed by 8-9 characters

4. Multi-line VAT extraction:
   - Look for ALL VAT line items in the document
   - Check for subtotals by VAT rate
   - Sum individual VAT amounts to get the true total
   - Don't stop at the first VAT amount found - scan the entire document

5. Prioritize accuracy:
   - Extract the actual total VAT amount shown on the document
   - If multiple VAT amounts exist, sum them for totalVatAmount
   - ALWAYS include ALL VAT amounts found in lineItems array
   - Cross-validate VAT calculations where possible
   - Mark confidence as high (0.8-1.0) only if VAT amounts are clearly visible

6. Currency handling:
   - Convert amounts to numbers (remove €, commas)
   - Assume EUR if currency not specified
   - Handle both "€123.45" and "123.45" formats

7. LEASE INVOICE RECOGNITION:
   - Identify lease/rental invoices from financial services companies
   - Keywords: "lease", "rental", "monthly payment", "Volkswagen Financial", "Financial Services"
   - CRITICAL: Do NOT confuse lease payments with VAT amounts
   - Look for dedicated VAT sections separate from payment amounts  
   - Lease invoices should be classified as PURCHASES (you're buying a service)
   - Examples of amounts to IGNORE: "Monthly Payment €126.62", "Lease Payment", "Amount Due"
   - Examples of amounts to EXTRACT: "VAT Amount €111.36", "Total VAT €111.36"

8. DOCUMENT CLASSIFICATION:
   - SALES: You provided goods/services (your business issued this document)
   - PURCHASES: You received goods/services (another business issued this to you)
   - Lease/rental invoices FROM financial services = PURCHASES
   - Standard invoices TO customers = SALES

Be extremely accurate with VAT amounts - this is critical for tax compliance. If uncertain about any VAT value, mark it as null and note in validationFlags.`,

  // Document Classification
  DOCUMENT_CLASSIFICATION: `Classify this business document for Irish VAT purposes.

Determine if this is a:
- SALES document (invoice, receipt for goods/services you provided)
- PURCHASE document (invoice, receipt for goods/services you bought)
- MIXED (contains both sales and purchase elements)

Consider:
- Document headers and language
- Business name positioning
- VAT number context
- Payment flow direction

Return classification with confidence score and reasoning.`,
  
  // Data Validation
  DATA_VALIDATION: `Validate this extracted VAT data for Irish compliance:

Check for:
1. Valid Irish VAT number formats
2. Correct VAT rate applications
3. Mathematical accuracy in calculations
4. Required information presence
5. Compliance with Irish VAT regulations

Flag any issues or inconsistencies.`
} as const

/**
 * VAT Analysis Prompts
 */
export const VAT_ANALYSIS_PROMPTS = {
  // VAT Calculation Review
  CALCULATION_REVIEW: `You are an Irish VAT compliance expert. Review this VAT calculation for accuracy and compliance.

VAT Data:
Sales VAT: €{salesVAT}
Purchase VAT: €{purchaseVAT}  
Net VAT Due: €{netVAT}
Period: {periodStart} to {periodEnd}
Business Type: {businessType}

Analyze:
1. Mathematical accuracy
2. Reasonable ratios for the business type
3. Compliance with Irish VAT regulations
4. Potential missing deductions
5. Any red flags or unusual patterns

Provide:
- Validation status (VALID/WARNING/ERROR)
- Issues found (if any)
- Recommendations for optimization
- Compliance notes

Return JSON format:
{
  "status": "VALID" | "WARNING" | "ERROR",
  "issues": ["array of issues"],
  "recommendations": ["array of suggestions"],
  "complianceNotes": ["array of regulatory reminders"],
  "riskLevel": "LOW" | "MEDIUM" | "HIGH",
  "reasoning": "detailed explanation"
}`,

  // Industry Benchmarking
  INDUSTRY_ANALYSIS: `Compare this VAT return against typical patterns for {industry} businesses in Ireland.

Metrics to analyze:
- Sales VAT to Purchase VAT ratio
- VAT as percentage of turnover
- Seasonal patterns
- Common deduction categories

Provide insights and suggestions for optimization.`,

  // Compliance Check
  COMPLIANCE_CHECK: `Review this VAT submission for Irish Revenue compliance:

Check against:
1. VAT rates and thresholds
2. Filing deadlines and requirements  
3. Documentation standards
4. Cross-border transaction rules
5. Exemption and zero-rating rules

Identify any compliance risks or missing elements.`
} as const

/**
 * Chat AI Prompts
 */
export const CHAT_PROMPTS = {
  // System prompt for VAT chatbot
  SYSTEM_PROMPT: `You are PAY VAT Assistant, an expert Irish VAT compliance chatbot helping businesses with their VAT obligations.

Your expertise covers:
- Irish VAT rates, rules and regulations
- VAT return preparation and submission
- Allowable deductions and exemptions
- Cross-border transaction VAT treatment
- Record keeping requirements
- Revenue Online Service (ROS) procedures

Guidelines:
1. Provide accurate, helpful answers about Irish VAT
2. Always clarify if advice is general guidance vs specific recommendations
3. Suggest consulting a tax professional for complex situations
4. Reference current Irish VAT rates and regulations
5. Be concise but thorough
6. If unsure, say so and suggest official Revenue sources
7. Never provide tax avoidance advice

Current Irish VAT rates:
- Standard: 23%
- Reduced: 13.5% (fuel, electricity, newspapers, etc.)
- Second reduced: 9% (hospitality, tourism, sporting facilities)
- Zero: 0% (exports, certain foods, books, medicines)

Keep responses helpful, professional, and compliant with Irish tax law.`,

  // Context-aware response with user data
  CONTEXTUAL_RESPONSE: `The user is currently working on their VAT submission. Here's their context:

Current VAT calculation:
- Sales VAT: €{salesVAT}
- Purchase VAT: €{purchaseVAT}
- Net VAT: €{netVAT}
- Documents processed: {documentCount}

Recent activity:
{recentActivity}

Answer their question with this context in mind, providing specific, actionable guidance.`,

  // Escalation prompt
  ESCALATION_CHECK: `Determine if this query requires human support or if AI can handle it.

Escalate to human if:
- Specific tax advice for complex situations
- Complaints or billing issues  
- Technical problems with the system
- Legal interpretations required
- Urgent compliance matters

Return: {"escalate": boolean, "reason": "string", "suggestedResponse": "string if not escalating"}`
} as const

/**
 * Utility function to format prompts with variables
 */
export function formatPrompt(template: string, variables: Record<string, any>): string {
  let formatted = template
  
  for (const [key, value] of Object.entries(variables)) {
    const placeholder = `{${key}}`
    formatted = formatted.replace(new RegExp(placeholder, 'g'), String(value))
  }
  
  return formatted
}

/**
 * Common prompt variables
 */
export const PROMPT_VARIABLES = {
  CURRENT_YEAR: new Date().getFullYear(),
  CURRENT_MONTH: new Date().toLocaleString('en-IE', { month: 'long' }),
  VAT_RATES: {
    STANDARD: '23%',
    REDUCED: '13.5%',
    TOURISM: '9%',
    ZERO: '0%'
  }
} as const