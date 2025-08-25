"use client"

import React, { useState, useEffect, useCallback } from "react"
import * as XLSX from 'xlsx'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { 
  FileText, 
  Download, 
  Eye, 
  Edit3, 
  Check, 
  X, 
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  BookOpen,
  Euro,
  Calculator,
  Save,
  RefreshCw
} from 'lucide-react'
import { toast } from "sonner"
import { formatCurrency } from "@/lib/vatUtils"


interface DocumentData {
  id: string
  originalName: string
  fileName: string
  mimeType: string
  fileSize: number
  category: string
  isScanned: boolean
  scanResult?: string
  uploadedAt: string
  extractedAmounts?: number[]
  confidence?: number
}

interface VATExtraction {
  salesVAT: number[]
  purchaseVAT: number[]
  confidence: number
  totalSalesVAT: number
  totalPurchaseVAT: number
}

interface DocumentViewerProps {
  isOpen: boolean
  onClose: () => void
  document: DocumentData | null
  extractedVAT?: VATExtraction | null
  onVATCorrection?: (correctedData: {
    salesVAT: number[]
    purchaseVAT: number[]
    feedback: 'CORRECT' | 'INCORRECT' | 'PARTIALLY_CORRECT'
    notes?: string
  }) => void
}

// Simple PDF Viewer Component with iframe approach
const SimplePDFViewer = ({ fileUrl, fileName }: { fileUrl: string, fileName: string }) => {
  const [useGoogleViewer, setUseGoogleViewer] = useState(false);
  
  if (useGoogleViewer) {
    const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`;
    return (
      <div className="w-full h-96 border rounded overflow-hidden">
        <iframe
          src={googleViewerUrl}
          title={`PDF Viewer (Google Docs) - ${fileName}`}
          width="100%"
          height="100%"
          className="border-0"
          style={{ minHeight: '400px' }}
        />
      </div>
    );
  }
  
  return (
    <div className="w-full h-96 border rounded overflow-hidden">
      <iframe
        src={fileUrl}
        title={`PDF Viewer - ${fileName}`}
        width="100%"
        height="100%"
        className="border-0"
        style={{ minHeight: '400px' }}
        onError={() => setUseGoogleViewer(true)}
      >
        <p>
          PDF cannot be displayed in this browser.
          <a href={fileUrl} download={fileName} className="text-blue-500 underline ml-2">
            Download {fileName}
          </a>
        </p>
      </iframe>
    </div>
  );
};


// Enhanced Spreadsheet Viewer Component using XLSX library
const SpreadsheetViewer = ({ fileUrl, fileName }: { fileUrl: string, fileName: string }) => {
  const [workbookData, setWorkbookData] = useState<{
    sheets: string[];
    currentSheet: string;
    data: any[][];
    workbook: XLSX.WorkBook;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ column: number; direction: 'asc' | 'desc' } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const ROWS_PER_PAGE = 50;

  // Helper function to format cell values
  const formatCellValue = (value: any): string => {
    if (value === null || value === undefined) return '';
    
    const str = String(value);
    
    // Check if it's a number
    const num = parseFloat(str);
    if (!isNaN(num) && isFinite(num)) {
      // If it looks like a currency or has more than 2 decimal places, format as currency
      if (str.includes('€') || str.includes('$') || str.includes('£') || num > 100 || (str.includes('.') && str.split('.')[1]?.length <= 2)) {
        return num.toLocaleString('en-IE', { 
          minimumFractionDigits: num % 1 === 0 ? 0 : 2,
          maximumFractionDigits: 2 
        });
      }
      // For other numbers, show as-is but with locale formatting
      return num.toLocaleString('en-IE');
    }
    
    return str.trim();
  };

  useEffect(() => {
    const loadSpreadsheet = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(fileUrl);
        if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`);
        
        const arrayBuffer = await response.arrayBuffer();
        
        // Determine file type and parse accordingly
        const isCSV = fileName.toLowerCase().endsWith('.csv');
        
        let workbook: XLSX.WorkBook;
        
        if (isCSV) {
          // For CSV files, convert to text first then parse
          const text = new TextDecoder('utf-8').decode(arrayBuffer);
          workbook = XLSX.read(text, { 
            type: 'string',
            raw: true,
            dateNF: 'yyyy-mm-dd'
          });
        } else {
          // For Excel files, parse binary
          workbook = XLSX.read(arrayBuffer, { 
            type: 'array',
            cellStyles: true,
            cellDates: true,
            cellFormula: true,
            raw: false
          });
        }
        
        const sheetNames = workbook.SheetNames;
        if (sheetNames.length === 0) throw new Error('No sheets found in workbook');
        
        const firstSheetName = sheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const data = XLSX.utils.sheet_to_json(worksheet, { 
          header: 1,
          defval: '',
          raw: false,
          blankrows: false
        }) as any[][];
        
        // Clean up empty rows and columns
        const cleanedData = data.filter(row => 
          row.some(cell => cell !== null && cell !== undefined && String(cell).trim() !== '')
        );
        
        setWorkbookData({
          sheets: sheetNames,
          currentSheet: firstSheetName,
          data: cleanedData,
          workbook
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load spreadsheet');
      } finally {
        setLoading(false);
      }
    };

    loadSpreadsheet();
  }, [fileUrl]);

  const switchSheet = (sheetName: string) => {
    if (!workbookData) return;
    
    const worksheet = workbookData.workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { 
      header: 1,
      defval: '',
      raw: false,
      blankrows: false
    }) as any[][];
    
    // Clean up empty rows
    const cleanedData = data.filter(row => 
      row.some(cell => cell !== null && cell !== undefined && String(cell).trim() !== '')
    );
    
    setWorkbookData({
      ...workbookData,
      currentSheet: sheetName,
      data: cleanedData
    });
    setCurrentPage(1);
    setSortConfig(null);
    setSearchTerm('');
  };

  const handleSort = (columnIndex: number) => {
    if (!workbookData?.data.length) return;
    
    const direction = sortConfig?.column === columnIndex && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ column: columnIndex, direction });
    setCurrentPage(1);
  };

  // Apply search filter and sorting
  const filteredAndSortedData = React.useMemo(() => {
    if (!workbookData?.data.length) return [];
    
    let processedData = [...workbookData.data];
    
    // Apply search filter (skip header row)
    if (searchTerm) {
      const headerRow = processedData[0] || [];
      const filteredRows = processedData.slice(1).filter(row => 
        row.some(cell => 
          String(cell || '').toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      processedData = [headerRow, ...filteredRows];
    }
    
    // Apply sorting (skip header row)
    if (sortConfig && processedData.length > 1) {
      const headerRow = processedData[0];
      const dataRows = processedData.slice(1).sort((a, b) => {
        const aVal = String(a[sortConfig.column] || '');
        const bVal = String(b[sortConfig.column] || '');
        
        // Try numeric comparison first
        const aNum = parseFloat(aVal);
        const bNum = parseFloat(bVal);
        
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return sortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum;
        }
        
        // String comparison
        return sortConfig.direction === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      });
      
      processedData = [headerRow, ...dataRows];
    }
    
    return processedData;
  }, [workbookData?.data, searchTerm, sortConfig]);

  // Pagination
  const totalRows = filteredAndSortedData.length - 1; // Exclude header
  const totalPages = Math.ceil(totalRows / ROWS_PER_PAGE);
  const startRow = (currentPage - 1) * ROWS_PER_PAGE + 1; // +1 to skip header
  const endRow = Math.min(startRow + ROWS_PER_PAGE - 1, filteredAndSortedData.length - 1);
  const currentPageData = filteredAndSortedData.length > 0 
    ? [filteredAndSortedData[0], ...filteredAndSortedData.slice(startRow, endRow + 1)]
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] p-8">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-green-600" />
          <p className="text-gray-600">Parsing spreadsheet...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-center p-8">
          <div className="bg-red-200 rounded-full p-6 mb-4 inline-block">
            <FileText className="h-16 w-16 text-red-600" />
          </div>
          <h3 className="text-lg font-normal text-gray-700 mb-2">Spreadsheet Parse Error</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button 
            onClick={() => window.open(fileUrl, '_blank')} 
            size="lg"
            className="bg-green-600 hover:bg-green-700"
          >
            <Download className="h-5 w-5 mr-2" />
            Download to View
          </Button>
        </div>
      </div>
    );
  }

  if (!workbookData || !currentPageData.length) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500">No data found in spreadsheet</p>
      </div>
    );
  }

  const maxColumns = Math.max(...currentPageData.map(row => row.length));

  return (
    <div className="w-full border rounded overflow-hidden bg-white" style={{ minHeight: '400px', maxHeight: '600px' }}>
      {/* Header with controls */}
      <div className="p-4 bg-gray-50 border-b space-y-3">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-normal text-gray-900">{fileName}</h4>
            <p className="text-sm text-gray-600">
              {totalRows} rows • {maxColumns} columns
              {workbookData.sheets.length > 1 && ` • Sheet: ${workbookData.currentSheet}`}
            </p>
          </div>
          <Button 
            onClick={() => window.open(fileUrl, '_blank')} 
            size="sm"
            variant="outline"
          >
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>
        </div>

        {/* Search and sheet controls */}
        <div className="flex gap-2 flex-wrap">
          <Input
            placeholder="Search spreadsheet..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="flex-1 min-w-48"
          />
          
          {workbookData.sheets.length > 1 && (
            <select 
              value={workbookData.currentSheet}
              onChange={(e) => switchSheet(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm bg-white"
            >
              {workbookData.sheets.map(sheetName => (
                <option key={sheetName} value={sheetName}>
                  Sheet: {sheetName}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-auto" style={{ maxHeight: '450px' }}>
        <table className="w-full text-sm">
          <thead className="bg-gray-100 sticky top-0">
            {currentPageData.length > 0 && (
              <tr>
                {Array.from({ length: maxColumns }, (_, colIndex) => {
                  const header = currentPageData[0]?.[colIndex] || `Column ${colIndex + 1}`;
                  const isSorted = sortConfig?.column === colIndex;
                  
                  return (
                    <th 
                      key={colIndex} 
                      className="px-3 py-2 text-left font-normal text-gray-900 border-b cursor-pointer hover:bg-gray-200"
                      onClick={() => handleSort(colIndex)}
                    >
                      <div className="flex items-center gap-1">
                        <span>{header}</span>
                        {isSorted && (
                          <span className="text-xs">
                            {sortConfig.direction === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            )}
          </thead>
          <tbody>
            {currentPageData.slice(1).map((row, rowIndex) => (
              <tr key={rowIndex} className="border-b hover:bg-gray-50">
                {Array.from({ length: maxColumns }, (_, colIndex) => {
                  const cellValue = row[colIndex];
                  const formattedValue = formatCellValue(cellValue);
                  const isNumeric = !isNaN(parseFloat(String(cellValue))) && isFinite(parseFloat(String(cellValue)));
                  
                  return (
                    <td 
                      key={colIndex} 
                      className={`px-3 py-2 text-gray-700 border-r last:border-r-0 ${isNumeric ? 'text-right font-mono' : ''}`}
                    >
                      {formattedValue}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-3 bg-gray-50 border-t flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {startRow} to {endRow} of {totalRows} rows
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm px-2">
              {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default function DocumentViewer({ isOpen, onClose, document, extractedVAT, onVATCorrection }: DocumentViewerProps) {
  const [viewMode, setViewMode] = useState<'view' | 'correct'>('view')
  const [documentUrl, setDocumentUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  
  // Correction state
  const [correctedSalesVAT, setCorrectedSalesVAT] = useState<string[]>([])
  const [correctedPurchaseVAT, setCorrectedPurchaseVAT] = useState<string[]>([])
  const [correctionNotes, setCorrectionNotes] = useState("")
  const [feedback, setFeedback] = useState<'CORRECT' | 'INCORRECT' | 'PARTIALLY_CORRECT'>('CORRECT')

  // Initialize correction state when document or extractedVAT changes
  useEffect(() => {
    if (extractedVAT) {
      setCorrectedSalesVAT((extractedVAT.salesVAT || []).map(v => v.toString()))
      setCorrectedPurchaseVAT((extractedVAT.purchaseVAT || []).map(v => v.toString()))
    } else {
      setCorrectedSalesVAT([''])
      setCorrectedPurchaseVAT([''])
    }
    setCorrectionNotes("")
    setFeedback('CORRECT')
    setViewMode('view')
  }, [document, extractedVAT])


  // Load document for viewing
  useEffect(() => {
    if (document && isOpen) {
      loadDocument()
    }
    
    // Cleanup blob URL when component unmounts or document changes
    return () => {
      if (documentUrl) {
        URL.revokeObjectURL(documentUrl)
      }
    }
  }, [document, isOpen])
  
  // Cleanup blob URL when component unmounts
  useEffect(() => {
    return () => {
      if (documentUrl) {
        URL.revokeObjectURL(documentUrl)
      }
    }
  }, [documentUrl])

  const loadDocument = useCallback(async () => {
    if (!document) return
    
    setLoading(true)
    try {
      // Add timeout to prevent infinite loading
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout
      
      // Use preview action for viewing, not download
      const response = await fetch(`/api/documents/${document.id}?action=preview`, {
        method: 'GET',
        credentials: 'include',
        signal: controller.signal,
        headers: {
          'Accept': '*/*'
        }
      })
      
      clearTimeout(timeoutId)
      
      if (response.ok) {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        setDocumentUrl(url)
      } else {
        const errorText = await response.text()
        console.error('Document preview failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        })
        
        if (response.status === 401) {
          toast.error('Authentication required. Please log in again.')
        } else if (response.status === 403) {
          toast.error('Access denied. You may not have permission to view this document.')
        } else {
          toast.error(`Failed to load document: ${response.statusText}`)
        }
      }
    } catch (error) {
      console.error('Error loading document:', error)
      if (error instanceof Error && error.name === 'AbortError') {
        toast.error('Document loading timed out. Please try again.')
      } else {
        toast.error('Error loading document')
      }
    } finally {
      setLoading(false)
    }
  }, [document])

  const handleDownload = async () => {
    if (!document) return
    
    try {
      const response = await fetch(`/api/documents/${document.id}?action=download`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*'
        }
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const a = globalThis.document.createElement('a')
        a.href = url
        a.download = document.originalName
        globalThis.document.body.appendChild(a)
        a.click()
        globalThis.document.body.removeChild(a)
        URL.revokeObjectURL(url)
        toast.success('Document downloaded')
      } else {
        toast.error('Failed to download document')
      }
    } catch (error) {
      console.error('Error downloading document:', error)
      toast.error('Error downloading document')
    }
  }

  const addVATLine = (type: 'sales' | 'purchase') => {
    if (type === 'sales') {
      setCorrectedSalesVAT([...correctedSalesVAT, ''])
    } else {
      setCorrectedPurchaseVAT([...correctedPurchaseVAT, ''])
    }
  }

  const removeVATLine = (type: 'sales' | 'purchase', index: number) => {
    if (type === 'sales') {
      const newLines = correctedSalesVAT.filter((_, i) => i !== index)
      setCorrectedSalesVAT(newLines.length > 0 ? newLines : [''])
    } else {
      const newLines = correctedPurchaseVAT.filter((_, i) => i !== index)
      setCorrectedPurchaseVAT(newLines.length > 0 ? newLines : [''])
    }
  }

  const updateVATLine = (type: 'sales' | 'purchase', index: number, value: string) => {
    if (type === 'sales') {
      const newLines = [...correctedSalesVAT]
      newLines[index] = value
      setCorrectedSalesVAT(newLines)
    } else {
      const newLines = [...correctedPurchaseVAT]
      newLines[index] = value
      setCorrectedPurchaseVAT(newLines)
    }
  }

  const calculateTotals = () => {
    const salesTotal = correctedSalesVAT
      .filter(v => v.trim() !== '')
      .reduce((sum, v) => sum + (parseFloat(v) || 0), 0)
    
    const purchaseTotal = correctedPurchaseVAT
      .filter(v => v.trim() !== '')
      .reduce((sum, v) => sum + (parseFloat(v) || 0), 0)
    
    return { salesTotal, purchaseTotal }
  }

  const handleSaveCorrection = () => {
    if (!onVATCorrection) return

    const salesAmounts = correctedSalesVAT
      .filter(v => v.trim() !== '')
      .map(v => parseFloat(v))
      .filter(v => !isNaN(v))

    const purchaseAmounts = correctedPurchaseVAT
      .filter(v => v.trim() !== '')
      .map(v => parseFloat(v))
      .filter(v => !isNaN(v))

    onVATCorrection({
      salesVAT: salesAmounts,
      purchaseVAT: purchaseAmounts,
      feedback,
      notes: correctionNotes.trim() || undefined
    })

    toast.success('VAT correction saved and AI training data submitted')
    setViewMode('view')
  }

  const handleConfirmCorrect = () => {
    if (!onVATCorrection || !extractedVAT) return

    onVATCorrection({
      salesVAT: extractedVAT.salesVAT,
      purchaseVAT: extractedVAT.purchaseVAT,
      feedback: 'CORRECT',
      notes: 'User confirmed extraction is correct'
    })

    toast.success('Confirmed! This helps improve AI accuracy.')
  }

  const getConfidenceColor = (confidence?: number) => {
    if (!confidence) return 'bg-gray-500'
    if (confidence >= 0.8) return 'bg-green-500'
    if (confidence >= 0.6) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getConfidenceText = (confidence?: number) => {
    if (!confidence) return 'Unknown'
    if (confidence >= 0.8) return 'High'
    if (confidence >= 0.6) return 'Medium'
    return 'Low'
  }

  // File type detection helper functions
  const getFileExtension = (filename: string) => {
    return filename?.split('.').pop()?.toLowerCase() || '';
  };

  const isSpreadsheet = (document: DocumentData) => {
    const ext = getFileExtension(document.originalName || document.fileName);
    const spreadsheetExts = ['xls', 'xlsx', 'csv'];
    const spreadsheetMimes = ['spreadsheet', 'excel', 'csv'];
    
    return spreadsheetExts.includes(ext) || 
           spreadsheetMimes.some(m => document.mimeType?.toLowerCase().includes(m));
  };

  const renderDocumentViewer = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-[50vh] sm:min-h-[70vh] bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border">
          <div className="text-center p-8">
            <RefreshCw className="h-12 w-12 animate-spin mx-auto mb-4 text-petrol-base" />
            <p className="text-gray-600 text-lg">Loading document...</p>
            <p className="text-gray-500 text-sm mt-2">Please wait while we prepare the preview</p>
          </div>
        </div>
      )
    }

    if (!documentUrl) {
      return (
        <div className="flex items-center justify-center min-h-[50vh] sm:min-h-[70vh] bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-center p-8">
            <div className="bg-gray-200 rounded-full p-6 mb-4 inline-block">
              <FileText className="h-16 w-16 text-gray-400" />
            </div>
            <h3 className="text-lg font-normal text-gray-700 mb-2">Preview Not Available</h3>
            <p className="text-gray-600 mb-4">The document preview couldn't be loaded</p>
            <Button 
              onClick={handleDownload} 
              size="lg"
              className="bg-[#2A7A8F] hover:bg-[#216477]"
            >
              <Download className="h-5 w-5 mr-2" />
              Download to View
            </Button>
          </div>
        </div>
      )
    }

    // Debug mimeType detection
    console.log('🔍 DOCUMENT VIEWER DEBUG:', {
      fileName: document?.originalName || document?.fileName,
      mimeType: document?.mimeType,
      documentKeys: document ? Object.keys(document) : []
    })
    
    // Improved PDF detection with multiple fallbacks
    const isPDF = document?.mimeType?.toLowerCase()?.includes('pdf') || 
                  document?.originalName?.toLowerCase()?.endsWith('.pdf') ||
                  document?.fileName?.toLowerCase()?.endsWith('.pdf')
    
    const isImage = document?.mimeType?.toLowerCase()?.includes('image')

    // Spreadsheet detection and rendering
    if (document && isSpreadsheet(document)) {
      return (
        <div className="relative bg-white rounded-lg border overflow-hidden min-h-[50vh] sm:min-h-[70vh]">
          <SpreadsheetViewer 
            fileUrl={documentUrl}
            fileName={document.originalName || 'spreadsheet'}
          />
        </div>
      )
    }

    if (isPDF) {
      return (
        <div className="relative bg-white rounded-lg border overflow-hidden min-h-[50vh] sm:min-h-[70vh]">
          <SimplePDFViewer 
            fileUrl={documentUrl}
            fileName={document?.originalName || 'document.pdf'}
          />
        </div>
      )
    }

    if (isImage) {
      return (
        <div className="relative bg-white rounded-lg border overflow-hidden min-h-[50vh] sm:min-h-[70vh] flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 opacity-50"></div>
          <img
            src={documentUrl}
            alt={document?.originalName || 'Document preview'}
            className="relative z-10 max-w-full max-h-full object-contain shadow-lg rounded"
          />
        </div>
      )
    }

    return (
      <div className="flex items-center justify-center min-h-[50vh] sm:min-h-[70vh] bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-center p-8">
          <div className="bg-gray-200 rounded-full p-6 mb-4 inline-block">
            <FileText className="h-16 w-16 text-gray-400" />
          </div>
          <h3 className="text-lg font-normal text-gray-700 mb-2">File Type Not Supported</h3>
          <p className="text-gray-600 mb-4">Preview not available for this file type</p>
          <Button 
            onClick={handleDownload} 
            size="lg"
            className="bg-[#2A7A8F] hover:bg-[#216477]"
          >
            <Download className="h-5 w-5 mr-2" />
            Download to View
          </Button>
        </div>
      </div>
    )
  }

  const { salesTotal, purchaseTotal } = calculateTotals()

  if (!isOpen || !document) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="flex flex-col overflow-hidden">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {document.originalName}
          </DialogTitle>
          <DialogDescription>
            Uploaded {new Date(document.uploadedAt).toLocaleDateString()} • {Math.round(document.fileSize / 1024)} KB
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6 min-h-0 overflow-hidden">
          {/* Document Viewer - Takes 2/3 width on desktop, full width on mobile */}
          <div className="xl:col-span-2 flex flex-col space-y-4 min-h-0">
            <div className="flex-shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h3 className="text-lg font-normal">Document Preview</h3>
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={handleDownload}
                  className="bg-[#2A7A8F] hover:bg-[#216477] touch-manipulation"
                >
                  <Download className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Download</span>
                </Button>
              </div>
            </div>

            <div className="flex-1 min-h-0">
              {renderDocumentViewer()}
            </div>
          </div>

          {/* VAT Data and Correction Panel - Takes 1/3 width on desktop, full width on mobile */}
          <div className="xl:col-span-1 flex flex-col space-y-4 min-h-0 overflow-y-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h3 className="text-lg font-normal">VAT Information</h3>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'view' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('view')}
                  className="touch-manipulation"
                >
                  <Eye className="h-4 w-4 sm:mr-1" />
                  <span className="hidden sm:inline">View</span>
                </Button>
                <Button
                  variant={viewMode === 'correct' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('correct')}
                  className="touch-manipulation"
                >
                  <Edit3 className="h-4 w-4 sm:mr-1" />
                  <span className="hidden sm:inline">Correct</span>
                </Button>
              </div>
            </div>

            {/* Document Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Document Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Category:</span>
                  <Badge variant="outline">{document.category}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">AI Processed:</span>
                  <Badge variant={document.isScanned ? "default" : "secondary"}>
                    {document.isScanned ? 'Yes' : 'No'}
                  </Badge>
                </div>
                {extractedVAT && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Confidence:</span>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getConfidenceColor(extractedVAT.confidence)}`} />
                      <span className="text-sm">{getConfidenceText(extractedVAT.confidence)} ({Math.round((extractedVAT.confidence || 0) * 100)}%)</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* View Mode */}
            {viewMode === 'view' && extractedVAT && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Calculator className="h-4 w-4" />
                    Extracted VAT Data
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-normal">Sales VAT</Label>
                    {extractedVAT.salesVAT && extractedVAT.salesVAT.length > 0 ? (
                      <div className="space-y-1">
                        {(extractedVAT.salesVAT || []).map((amount, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Euro className="h-3 w-3 text-gray-400" />
                            <span className="text-sm">{formatCurrency(amount).replace('€', '')}</span>
                          </div>
                        ))}
                        <div className="border-t pt-2 mt-2">
                          <span className="text-sm font-normal">Total: {formatCurrency(extractedVAT.totalSalesVAT)}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No sales VAT detected</p>
                    )}
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-sm font-normal">Purchase VAT</Label>
                    {extractedVAT.purchaseVAT && extractedVAT.purchaseVAT.length > 0 ? (
                      <div className="space-y-1">
                        {(extractedVAT.purchaseVAT || []).map((amount, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Euro className="h-3 w-3 text-gray-400" />
                            <span className="text-sm">{formatCurrency(amount).replace('€', '')}</span>
                          </div>
                        ))}
                        <div className="border-t pt-2 mt-2">
                          <span className="text-sm font-normal">Total: {formatCurrency(extractedVAT.totalPurchaseVAT)}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No purchase VAT detected</p>
                    )}
                  </div>

                  <Separator />

                  <div className="flex gap-2">
                    <Button onClick={handleConfirmCorrect} className="flex-1 bg-green-600 hover:bg-green-700">
                      <ThumbsUp className="h-4 w-4 mr-2" />
                      Confirm Correct
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setViewMode('correct')}
                      className="flex-1"
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Needs Correction
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Correction Mode */}
            {viewMode === 'correct' && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Edit3 className="h-4 w-4" />
                    Correct VAT Data
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-normal">Feedback Type</Label>
                    <Select value={feedback} onValueChange={(value: any) => setFeedback(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PARTIALLY_CORRECT">Partially Correct</SelectItem>
                        <SelectItem value="INCORRECT">Incorrect</SelectItem>
                        <SelectItem value="CORRECT">Actually Correct</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm font-normal">Sales VAT Amounts</Label>
                      <Button variant="outline" size="sm" onClick={() => addVATLine('sales')}>
                        Add Line
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {correctedSalesVAT.map((amount, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Euro className="h-4 w-4 text-gray-400" />
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => updateVATLine('sales', index, e.target.value)}
                            className="flex-1"
                          />
                          {correctedSalesVAT.length > 1 && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => removeVATLine('sales', index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <div className="text-sm text-gray-600">
                        Total: €{salesTotal.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm font-normal">Purchase VAT Amounts</Label>
                      <Button variant="outline" size="sm" onClick={() => addVATLine('purchase')}>
                        Add Line
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {correctedPurchaseVAT.map((amount, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Euro className="h-4 w-4 text-gray-400" />
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => updateVATLine('purchase', index, e.target.value)}
                            className="flex-1"
                          />
                          {correctedPurchaseVAT.length > 1 && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => removeVATLine('purchase', index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <div className="text-sm text-gray-600">
                        Total: €{purchaseTotal.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-normal">Notes (Optional)</Label>
                    <Textarea
                      placeholder="Explain the correction to help train the AI..."
                      value={correctionNotes}
                      onChange={(e) => setCorrectionNotes(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleSaveCorrection} className="flex-1">
                      <Save className="h-4 w-4 mr-2" />
                      Save & Train AI
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setViewMode('view')}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}