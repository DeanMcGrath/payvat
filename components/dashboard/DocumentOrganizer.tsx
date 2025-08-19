"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  FolderOpen, 
  Folder, 
  FileText,
  ChevronDown,
  ChevronRight,
  Calendar,
  Search,
  Filter,
  Download,
  Eye,
  Euro,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react"
import { formatCurrency } from "@/lib/vatUtils"

interface DocumentFolder {
  id: string
  year: number
  month: number
  totalSalesAmount: number
  totalPurchaseAmount: number
  totalSalesVAT: number
  totalPurchaseVAT: number
  totalNetVAT: number
  documentCount: number
  salesDocumentCount: number
  purchaseDocumentCount: number
  averageProcessingQuality?: number
  averageVATAccuracy?: number
  isComplete: boolean
  needsReview: boolean
  complianceStatus: string
  lastDocumentAt?: Date
  documents: DocumentSummary[]
}

interface DocumentSummary {
  id: string
  fileName: string
  originalName: string
  category: string
  extractedDate?: Date
  invoiceTotal?: number
  vatAccuracy?: number
  processingQuality?: number
  validationStatus: string
  complianceIssues: string[]
  uploadedAt: Date
}

interface DocumentOrganizerProps {
  onDocumentSelect?: (document: DocumentSummary) => void
  onFolderSelect?: (folder: DocumentFolder) => void
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export default function DocumentOrganizer({ 
  onDocumentSelect, 
  onFolderSelect 
}: DocumentOrganizerProps) {
  const [folders, setFolders] = useState<DocumentFolder[]>([])
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDocumentFolders()
  }, [])

  const loadDocumentFolders = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/documents/organize', {
        method: 'GET',
        credentials: 'include'
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success && result.folders) {
          setFolders(result.folders.map((folder: any) => ({
            ...folder,
            lastDocumentAt: folder.lastDocumentAt ? new Date(folder.lastDocumentAt) : undefined,
            documents: folder.documents?.map((doc: any) => ({
              ...doc,
              extractedDate: doc.extractedDate ? new Date(doc.extractedDate) : undefined,
              uploadedAt: new Date(doc.uploadedAt)
            })) || []
          })))
        }
      }
    } catch (error) {
      console.error('Failed to load document folders:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId)
    } else {
      newExpanded.add(folderId)
    }
    setExpandedFolders(newExpanded)
  }

  const getComplianceStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLIANT': return 'bg-green-100 text-green-800'
      case 'NON_COMPLIANT': return 'bg-red-100 text-red-800'
      case 'NEEDS_REVIEW': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getComplianceIcon = (status: string) => {
    switch (status) {
      case 'COMPLIANT': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'NON_COMPLIANT': return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'NEEDS_REVIEW': return <Clock className="h-4 w-4 text-yellow-500" />
      default: return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const filteredFolders = folders.filter(folder => {
    if (selectedYear && folder.year !== selectedYear) return false
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      const monthName = MONTHS[folder.month - 1].toLowerCase()
      return monthName.includes(searchLower) || 
             folder.year.toString().includes(searchLower) ||
             folder.documents.some(doc => 
               doc.fileName.toLowerCase().includes(searchLower) ||
               doc.originalName.toLowerCase().includes(searchLower)
             )
    }
    return true
  })

  const groupedFolders = filteredFolders.reduce((acc, folder) => {
    if (!acc[folder.year]) {
      acc[folder.year] = []
    }
    acc[folder.year].push(folder)
    return acc
  }, {} as Record<number, DocumentFolder[]>)

  const years = Object.keys(groupedFolders)
    .map(Number)
    .sort((a, b) => b - a) // Most recent first

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FolderOpen className="h-5 w-5 mr-2" />
            Document Organization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-sm text-muted-foreground">Loading document folders...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <FolderOpen className="h-5 w-5 mr-2" />
            Document Organization
          </div>
          <Badge variant="outline">
            {folders.reduce((sum, folder) => sum + folder.documentCount, 0)} docs
          </Badge>
        </CardTitle>
        
        {/* Search and Filter Controls */}
        <div className="flex space-x-2 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents and folders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={selectedYear || ''}
            onChange={(e) => setSelectedYear(e.target.value ? Number(e.target.value) : null)}
            className="px-3 py-2 border border-input bg-background rounded-md text-sm"
          >
            <option value="">All Years</option>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-2">
        {years.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No documents organized yet</p>
            <p className="text-sm">Upload documents to see them organized by date</p>
          </div>
        ) : (
          years.map(year => (
            <div key={year} className="space-y-1">
              {/* Year Header */}
              <div 
                className="flex items-center justify-between p-3 bg-muted rounded-lg cursor-pointer hover:bg-muted/80"
                onClick={() => toggleFolder(`year-${year}`)}
              >
                <div className="flex items-center space-x-2">
                  {expandedFolders.has(`year-${year}`) ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                  <Calendar className="h-4 w-4" />
                  <span className="font-medium">{year}</span>
                  <Badge variant="secondary">
                    {groupedFolders[year].length} month{groupedFolders[year].length !== 1 ? 's' : ''}
                  </Badge>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  {groupedFolders[year].reduce((sum, folder) => sum + folder.documentCount, 0)} documents
                </div>
              </div>

              {/* Year Folders */}
              {expandedFolders.has(`year-${year}`) && (
                <div className="ml-6 space-y-2">
                  {groupedFolders[year]
                    .sort((a, b) => b.month - a.month) // Most recent month first
                    .map(folder => (
                    <div key={folder.id} className="space-y-2">
                      {/* Month Folder */}
                      <div 
                        className="flex items-center justify-between p-3 bg-card border rounded-lg cursor-pointer hover:bg-accent"
                        onClick={() => {
                          toggleFolder(folder.id)
                          if (onFolderSelect) onFolderSelect(folder)
                        }}
                      >
                        <div className="flex items-center space-x-3">
                          {expandedFolders.has(folder.id) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                          <Folder className="h-4 w-4 text-blue-500" />
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{MONTHS[folder.month - 1]}</span>
                              <Badge variant="outline">
                                {folder.documentCount} docs
                              </Badge>
                              {folder.needsReview && (
                                <Badge variant="destructive" className="text-xs">
                                  Needs Review
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Sales: {formatCurrency(folder.totalSalesVAT)} • 
                              Purchase: {formatCurrency(folder.totalPurchaseVAT)}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Badge className={getComplianceStatusColor(folder.complianceStatus)}>
                            {getComplianceIcon(folder.complianceStatus)}
                            <span className="ml-1 capitalize">{folder.complianceStatus.replace('_', ' ')}</span>
                          </Badge>
                        </div>
                      </div>

                      {/* Documents in Folder */}
                      {expandedFolders.has(folder.id) && folder.documents.length > 0 && (
                        <div className="ml-6 space-y-1">
                          {folder.documents.map(document => (
                            <div
                              key={document.id}
                              className="flex items-center justify-between p-2 bg-accent/50 rounded border cursor-pointer hover:bg-accent"
                              onClick={() => {
                                if (onDocumentSelect) onDocumentSelect(document)
                              }}
                            >
                              <div className="flex items-center space-x-2">
                                <FileText className="h-3 w-3 text-muted-foreground" />
                                <div>
                                  <div className="text-sm font-medium truncate max-w-48">
                                    {document.originalName}
                                  </div>
                                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                    {document.invoiceTotal && (
                                      <>
                                        <Euro className="h-3 w-3" />
                                        <span>{formatCurrency(document.invoiceTotal)}</span>
                                      </>
                                    )}
                                    {document.vatAccuracy && (
                                      <>
                                        <span>•</span>
                                        <span>{(document.vatAccuracy * 100).toFixed(0)}% accuracy</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-1">
                                <Badge variant="outline" className="text-xs">
                                  {document.category.replace('_', ' ')}
                                </Badge>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                  <Eye className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}