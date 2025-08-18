"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  FileText, 
  Upload, 
  Calculator, 
  TrendingUp, 
  Calendar,
  Download,
  CreditCard,
  Settings,
  HelpCircle,
  Zap,
  ChevronRight,
  Clock
} from "lucide-react"

interface QuickAction {
  id: string
  title: string
  description: string
  icon: React.ComponentType<any>
  href: string
  category: 'filing' | 'documents' | 'reports' | 'tools' | 'help'
  priority: 'high' | 'medium' | 'low'
  badge?: string
  shortcut?: string
  estimatedTime?: string
}

interface QuickActionsProps {
  className?: string
}

export default function QuickActions({ className }: QuickActionsProps) {
  const actions: QuickAction[] = [
    {
      id: 'submit-vat',
      title: 'Submit VAT Return',
      description: 'File your quarterly VAT return',
      icon: FileText,
      href: '/vat-period',
      category: 'filing',
      priority: 'high',
      badge: 'Due Soon',
      shortcut: 'Ctrl+S',
      estimatedTime: '10 min'
    },
    {
      id: 'upload-docs',
      title: 'Upload Documents',
      description: 'Add invoices, receipts, and statements',
      icon: Upload,
      href: '/vat-submission',
      category: 'documents',
      priority: 'high',
      estimatedTime: '5 min'
    },
    {
      id: 'calculate-vat',
      title: 'VAT Calculator',
      description: 'Quick VAT calculations and estimates',
      icon: Calculator,
      href: '/vat-calculator-ireland',
      category: 'tools',
      priority: 'medium',
      estimatedTime: '2 min'
    },
    {
      id: 'view-reports',
      title: 'View Reports',
      description: 'Analyze your VAT performance',
      icon: TrendingUp,
      href: '/reports',
      category: 'reports',
      priority: 'medium',
      estimatedTime: '3 min'
    },
    {
      id: 'tax-calendar',
      title: 'Tax Calendar',
      description: 'Check important deadlines',
      icon: Calendar,
      href: '/tax-calendar-ireland',
      category: 'tools',
      priority: 'low',
      estimatedTime: '1 min'
    },
    {
      id: 'download-reports',
      title: 'Download Reports',
      description: 'Export your data and summaries',
      icon: Download,
      href: '/reports',
      category: 'reports',
      priority: 'low',
      estimatedTime: '2 min'
    },
    {
      id: 'payment-history',
      title: 'Payment History',
      description: 'View past VAT payments',
      icon: CreditCard,
      href: '/reports?type=payment-history',
      category: 'reports',
      priority: 'low',
      estimatedTime: '2 min'
    },
    {
      id: 'help-guide',
      title: 'VAT Guide',
      description: 'Learn about VAT requirements',
      icon: HelpCircle,
      href: '/vat-guide',
      category: 'help',
      priority: 'low',
      estimatedTime: '5 min'
    }
  ]

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'filing': return <FileText className="h-4 w-4" />
      case 'documents': return <Upload className="h-4 w-4" />
      case 'reports': return <TrendingUp className="h-4 w-4" />
      case 'tools': return <Calculator className="h-4 w-4" />
      case 'help': return <HelpCircle className="h-4 w-4" />
      default: return <Zap className="h-4 w-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'filing': return "text-red-600 bg-red-50"
      case 'documents': return "text-blue-600 bg-blue-50"
      case 'reports': return "text-green-600 bg-green-50"
      case 'tools': return "text-purple-600 bg-purple-50"
      case 'help': return "text-gray-600 bg-gray-50"
      default: return "text-gray-600 bg-gray-50"
    }
  }

  const getBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'high': return "destructive"
      case 'medium': return "secondary"
      case 'low': return "outline"
      default: return "outline"
    }
  }

  const handleActionClick = (action: QuickAction) => {
    window.location.href = action.href
  }

  const groupedActions = actions.reduce((groups, action) => {
    if (!groups[action.category]) {
      groups[action.category] = []
    }
    groups[action.category].push(action)
    return groups
  }, {} as Record<string, QuickAction[]>)

  const categoryOrder = ['filing', 'documents', 'reports', 'tools', 'help']
  const categoryNames = {
    filing: 'VAT Filing',
    documents: 'Documents',
    reports: 'Reports & Analytics',
    tools: 'Tools',
    help: 'Help & Guidance'
  }

  return (
    <Card className={`${className} card-modern hover-lift`}>
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-foreground flex items-center space-x-2">
          <Zap className="h-6 w-6 text-primary" />
          <span>Quick Actions</span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">Common tasks and frequent operations</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {categoryOrder.map(category => {
            const categoryActions = groupedActions[category]
            if (!categoryActions || categoryActions.length === 0) return null

            return (
              <div key={category} className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className={`p-1.5 rounded-lg ${getCategoryColor(category)}`}>
                    {getCategoryIcon(category)}
                  </div>
                  <h4 className="text-sm font-semibold text-foreground">
                    {categoryNames[category as keyof typeof categoryNames]}
                  </h4>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {categoryActions.map(action => {
                    const Icon = action.icon
                    return (
                      <Button
                        key={action.id}
                        variant="ghost"
                        className="h-auto p-4 justify-start text-left hover:bg-gray-50 hover:border-primary/20 border border-transparent group"
                        onClick={() => handleActionClick(action)}
                      >
                        <div className="flex items-start space-x-3 w-full">
                          <div className="flex-shrink-0 p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h5 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                                {action.title}
                              </h5>
                              <div className="flex items-center space-x-1">
                                {action.badge && (
                                  <Badge variant={getBadgeVariant(action.priority)} className="text-xs">
                                    {action.badge}
                                  </Badge>
                                )}
                                <ChevronRight className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
                              </div>
                            </div>
                            
                            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                              {action.description}
                            </p>
                            
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              {action.estimatedTime && (
                                <div className="flex items-center space-x-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{action.estimatedTime}</span>
                                </div>
                              )}
                              
                              {action.shortcut && (
                                <div className="hidden sm:flex items-center space-x-1">
                                  <kbd className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-mono">
                                    {action.shortcut}
                                  </kbd>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </Button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
        
        {/* Quick Stats */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <p className="text-lg font-bold text-foreground">12</p>
              <p className="text-xs text-muted-foreground">Tasks This Week</p>
            </div>
            <div className="space-y-1">
              <p className="text-lg font-bold text-foreground">3</p>
              <p className="text-xs text-muted-foreground">Pending Actions</p>
            </div>
            <div className="space-y-1">
              <p className="text-lg font-bold text-foreground">98%</p>
              <p className="text-xs text-muted-foreground">On-Time Rate</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}