"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  CreditCard, 
  Upload, 
  FileText, 
  Search,
  Filter,
  Download,
  Eye,
  X,
  ArrowUpDown,
  Loader2,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Calendar,
  Euro
} from "lucide-react"
import { toast } from "sonner"
import { formatCurrency } from "@/lib/vatUtils"
import FileUpload from "@/components/file-upload"

interface BankStatement {
  id: string
  fileName: string
  originalName: string
  fileSize: number
  uploadedAt: string
  processedAt?: string
  status: 'processing' | 'completed' | 'failed'
  transactionCount?: number
  dateRange?: {
    start: string
    end: string
  }
  accountNumber?: string
  bankName?: string
}

interface Transaction {
  id: string
  date: string
  description: string
  amount: number
  type: 'credit' | 'debit'
  category?: string
  balance?: number
  statementId: string
  reconciled: boolean
  vatRelevant: boolean
}

interface PaymentStats {
  totalIncoming: number
  totalOutgoing: number
  netFlow: number
  transactionCount: number
  reconciledCount: number
  vatRelevantCount: number
}

export default function PaymentsPage() {
  const [bankStatements, setBankStatements] = useState<BankStatement[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [uploadingStatement, setUploadingStatement] = useState(false)
  const [stats, setStats] = useState<PaymentStats>({
    totalIncoming: 0,
    totalOutgoing: 0,
    netFlow: 0,
    transactionCount: 0,
    reconciledCount: 0,
    vatRelevantCount: 0
  })

  // Filters
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMonth, setSelectedMonth] = useState<string>("all")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [sortBy, setSortBy] = useState<"date" | "amount">("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  const currentYear = new Date().getFullYear()
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  useEffect(() => {
    loadPaymentsData()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [transactions, searchQuery, selectedMonth, selectedType, selectedCategory, sortBy, sortOrder])

  const loadPaymentsData = async () => {
    try {
      setLoading(true)
      
      // Mock data - replace with real API calls
      const mockStatements: BankStatement[] = [
        {
          id: '1',
          fileName: 'statement-dec-2024.pdf',
          originalName: 'Bank Statement December 2024.pdf',
          fileSize: 245600,
          uploadedAt: '2024-12-15T10:30:00Z',
          processedAt: '2024-12-15T10:35:00Z',
          status: 'completed',
          transactionCount: 47,
          dateRange: {
            start: '2024-12-01',
            end: '2024-12-31'
          },
          accountNumber: '****1234',
          bankName: 'AIB Bank'
        },
        {
          id: '2',
          fileName: 'statement-nov-2024.pdf',
          originalName: 'Bank Statement November 2024.pdf',
          fileSize: 198400,
          uploadedAt: '2024-11-30T14:20:00Z',
          processedAt: '2024-11-30T14:25:00Z',
          status: 'completed',
          transactionCount: 52,
          dateRange: {
            start: '2024-11-01',
            end: '2024-11-30'
          },
          accountNumber: '****1234',
          bankName: 'AIB Bank'
        }
      ]

      const mockTransactions: Transaction[] = [
        {
          id: '1',
          date: '2024-12-15',
          description: 'Invoice Payment - ABC Ltd',
          amount: 1250.00,
          type: 'credit',
          category: 'Sales',
          balance: 15420.50,
          statementId: '1',
          reconciled: true,
          vatRelevant: true
        },
        {
          id: '2',
          date: '2024-12-14',
          description: 'Office Supplies - Staples',
          amount: -85.50,
          type: 'debit',
          category: 'Expenses',
          balance: 14170.50,
          statementId: '1',
          reconciled: false,
          vatRelevant: true
        },
        {
          id: '3',
          date: '2024-12-13',
          description: 'Salary Payment',
          amount: -3200.00,
          type: 'debit',
          category: 'Payroll',
          balance: 14256.00,
          statementId: '1',
          reconciled: true,
          vatRelevant: false
        },
        {
          id: '4',
          date: '2024-12-12',
          description: 'Client Payment - XYZ Corp',
          amount: 2800.00,
          type: 'credit',
          category: 'Sales',
          balance: 17456.00,
          statementId: '1',
          reconciled: true,
          vatRelevant: true
        },
        {
          id: '5',
          date: '2024-11-28',
          description: 'Software Subscription',
          amount: -99.99,
          type: 'debit',
          category: 'Technology',
          balance: 14656.00,
          statementId: '2',
          reconciled: false,
          vatRelevant: true
        }
      ]

      setBankStatements(mockStatements)
      setTransactions(mockTransactions)

      // Calculate stats
      const incoming = mockTransactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0)
      const outgoing = mockTransactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + Math.abs(t.amount), 0)
      
      setStats({
        totalIncoming: incoming,
        totalOutgoing: outgoing,
        netFlow: incoming - outgoing,
        transactionCount: mockTransactions.length,
        reconciledCount: mockTransactions.filter(t => t.reconciled).length,
        vatRelevantCount: mockTransactions.filter(t => t.vatRelevant).length
      })

    } catch (error) {
      console.error('Failed to load payments data:', error)
      toast.error('Failed to load payment information')
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...transactions]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(t => 
        t.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Month filter
    if (selectedMonth !== "all") {
      const monthIndex = parseInt(selectedMonth)
      filtered = filtered.filter(t => {
        const transactionDate = new Date(t.date)
        return transactionDate.getMonth() + 1 === monthIndex
      })
    }

    // Type filter
    if (selectedType !== "all") {
      filtered = filtered.filter(t => t.type === selectedType)
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(t => t.category === selectedCategory)
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0
      if (sortBy === "date") {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime()
      } else if (sortBy === "amount") {
        comparison = Math.abs(a.amount) - Math.abs(b.amount)
      }
      return sortOrder === "asc" ? comparison : -comparison
    })

    setFilteredTransactions(filtered)
  }

  const handleStatementUpload = async (file: File) => {
    try {
      setUploadingStatement(true)
      
      // Here you would upload and process the bank statement
      // For now, we'll just show a success message
      toast.success('Bank statement uploaded successfully and is being processed')
      
      // Reload data after upload
      await loadPaymentsData()
      
    } catch (error) {
      console.error('Failed to upload bank statement:', error)
      toast.error('Failed to upload bank statement')
    } finally {
      setUploadingStatement(false)
    }
  }

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedMonth("all")
    setSelectedType("all")
    setSelectedCategory("all")
    setSortBy("date")
    setSortOrder("desc")
  }

  const activeFiltersCount = 
    (searchQuery ? 1 : 0) +
    (selectedMonth !== "all" ? 1 : 0) +
    (selectedType !== "all" ? 1 : 0) +
    (selectedCategory !== "all" ? 1 : 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-brand-300" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Incoming</p>
                <p className="text-2xl font-normal text-green-600">{formatCurrency(stats.totalIncoming)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Outgoing</p>
                <p className="text-2xl font-normal text-red-600">{formatCurrency(stats.totalOutgoing)}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Net Flow</p>
                <p className={`text-2xl font-normal ${stats.netFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(stats.netFlow)}
                </p>
              </div>
              <Euro className="h-8 w-8 text-petrol-dark" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">VAT Relevant</p>
                <p className="h3 text-petrol-dark">
                  {stats.vatRelevantCount}/{stats.transactionCount}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-petrol-dark" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bank Statement Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-petrol-dark">
            <Upload className="h-5 w-5" />
            Upload Bank Statements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <FileUpload
              category="BANK_STATEMENTS"
              title="Upload Bank Statements"
              description="Upload PDF or CSV bank statements to automatically import transactions"
              acceptedFiles={['.pdf', '.csv', '.xlsx', '.xls']}
              enableBatchMode={true}
              maxConcurrentUploads={3}
              showBatchProgress={true}
              onUploadSuccess={(doc) => {
                toast.success('Bank statement uploaded successfully')
                loadPaymentsData()
              }}
            />
            
            {bankStatements.length > 0 && (
              <div className="mt-6">
                <h4 className="font-normal mb-3">Uploaded Statements</h4>
                <div className="space-y-2">
                  {bankStatements.map((statement) => (
                    <div key={statement.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md border">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-petrol-base" />
                        <div>
                          <div className="font-normal text-sm">{statement.originalName}</div>
                          <div className="text-xs text-gray-500">
                            {statement.bankName} • {statement.accountNumber} • 
                            {statement.transactionCount} transactions •
                            Uploaded {new Date(statement.uploadedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={statement.status === 'completed' ? 'default' : 'secondary'}>
                          {statement.status}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-petrol-dark">
              <Filter className="h-5 w-5" />
              Transaction Filters
              {activeFiltersCount > 0 && (
                <Badge variant="secondary">{activeFiltersCount}</Badge>
              )}
            </CardTitle>
            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4" />
                Clear
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-normal">Search</label>
              <Input
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-normal">Month</label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Months</SelectItem>
                  {months.map((month, index) => (
                    <SelectItem key={month} value={(index + 1).toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-normal">Type</label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="credit">Credit</SelectItem>
                  <SelectItem value="debit">Debit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-normal">Category</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Sales">Sales</SelectItem>
                  <SelectItem value="Expenses">Expenses</SelectItem>
                  <SelectItem value="Payroll">Payroll</SelectItem>
                  <SelectItem value="Technology">Technology</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-normal">Sort By</label>
              <div className="flex gap-2">
                <Select value={sortBy} onValueChange={(value: "date" | "amount") => setSortBy(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="amount">Amount</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  className="px-2"
                >
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-petrol-dark">
            <CreditCard className="h-5 w-5" />
            Transaction History
            <Badge variant="secondary">{filteredTransactions.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length > 0 ? (
            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-4 items-center px-4 py-2 bg-gray-50 rounded-lg text-xs font-normal text-gray-600 uppercase tracking-wide">
                <div className="col-span-2">Date</div>
                <div className="col-span-4">Description</div>
                <div className="col-span-2">Category</div>
                <div className="col-span-2">Amount</div>
                <div className="col-span-1">Status</div>
                <div className="col-span-1">VAT</div>
              </div>
              
              {filteredTransactions.map((transaction) => (
                <div key={transaction.id} className="grid grid-cols-12 gap-4 items-center p-4 bg-white rounded-lg border hover:bg-gray-50">
                  <div className="col-span-2 text-sm">
                    {new Date(transaction.date).toLocaleDateString()}
                  </div>
                  <div className="col-span-4">
                    <div className="text-sm font-normal">{transaction.description}</div>
                  </div>
                  <div className="col-span-2">
                    {transaction.category && (
                      <Badge variant="outline">{transaction.category}</Badge>
                    )}
                  </div>
                  <div className="col-span-2">
                    <div className={`text-sm font-normal ${
                      transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                    </div>
                  </div>
                  <div className="col-span-1">
                    {transaction.reconciled ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                    )}
                  </div>
                  <div className="col-span-1">
                    {transaction.vatRelevant && (
                      <CheckCircle className="h-4 w-4 text-petrol-base" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-normal text-gray-900 mb-2">No Transactions Found</h3>
              <p className="text-gray-500 mb-4">
                Upload bank statements to import your transaction history
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}