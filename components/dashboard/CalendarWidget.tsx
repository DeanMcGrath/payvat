"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  FileText,
  Euro,
  AlertTriangle,
  CheckCircle,
  Loader2
} from "lucide-react"

interface CalendarEvent {
  id: string
  date: Date
  type: 'deadline' | 'submitted' | 'payment'
  title: string
  description: string
  status: 'upcoming' | 'due' | 'overdue' | 'completed'
  amount?: number
}

interface CalendarWidgetProps {
  className?: string
}

export default function CalendarWidget({ className }: CalendarWidgetProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  useEffect(() => {
    fetchCalendarEvents()
  }, [currentDate])

  const fetchCalendarEvents = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/reports?type=calendar-events', {
        method: 'GET',
        credentials: 'include'
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success && result.report?.events) {
          setEvents(result.report.events.map((e: any) => ({
            ...e,
            date: new Date(e.date)
          })))
        } else {
          generateMockEvents()
        }
      } else {
        generateMockEvents()
      }
    } catch (err) {
      generateMockEvents()
    } finally {
      setLoading(false)
    }
  }

  const generateMockEvents = () => {
    const now = new Date()
    const mockEvents: CalendarEvent[] = [
      {
        id: '1',
        date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7),
        type: 'deadline',
        title: 'VAT Return Due',
        description: 'Q4 VAT return submission deadline',
        status: 'upcoming',
        amount: 2500
      },
      {
        id: '2',
        date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 5),
        type: 'submitted',
        title: 'VAT Return Submitted',
        description: 'Q3 VAT return successfully filed',
        status: 'completed'
      },
      {
        id: '3',
        date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 14),
        type: 'payment',
        title: 'VAT Payment Due',
        description: 'Payment for Q4 VAT return',
        status: 'upcoming',
        amount: 2500
      },
      {
        id: '4',
        date: new Date(now.getFullYear(), now.getMonth() + 1, 20),
        type: 'deadline',
        title: 'VAT Return Due',
        description: 'Next quarterly VAT return',
        status: 'upcoming'
      }
    ]
    setEvents(mockEvents)
  }

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay()
    return firstDay === 0 ? 6 : firstDay - 1 // Convert Sunday = 0 to Monday = 0
  }

  const getMonthName = (date: Date) => {
    return date.toLocaleDateString('en-IE', { month: 'long', year: 'numeric' })
  }

  const getEventsForDate = (date: Date) => {
    return events.filter(event => 
      event.date.getDate() === date.getDate() &&
      event.date.getMonth() === date.getMonth() &&
      event.date.getFullYear() === date.getFullYear()
    )
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'deadline': return <FileText className="h-3 w-3" />
      case 'submitted': return <CheckCircle className="h-3 w-3" />
      case 'payment': return <Euro className="h-3 w-3" />
      default: return <CalendarIcon className="h-3 w-3" />
    }
  }

  const getEventColor = (status: string) => {
    switch (status) {
      case 'upcoming': return "bg-blue-100 text-petrol-dark"
      case 'due': return "bg-yellow-100 text-yellow-800"
      case 'overdue': return "bg-red-100 text-red-800"
      case 'completed': return "bg-green-100 text-green-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1)
      } else {
        newDate.setMonth(newDate.getMonth() + 1)
      }
      return newDate
    })
  }

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []
    const today = new Date()

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8"></div>)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      const dayEvents = getEventsForDate(date)
      const isToday = date.toDateString() === today.toDateString()
      const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString()

      days.push(
        <div
          key={day}
          className={`h-8 text-xs flex flex-col items-center justify-center cursor-pointer rounded transition-colors relative
            ${isToday ? 'bg-primary text-white font-normal' : ''}
            ${isSelected ? 'ring-2 ring-primary' : ''}
            ${!isToday && !isSelected ? 'hover:bg-gray-100' : ''}
          `}
          onClick={() => setSelectedDate(date)}
        >
          <span>{day}</span>
          {dayEvents.length > 0 && (
            <div className="absolute -bottom-1 flex space-x-0.5">
              {dayEvents.slice(0, 3).map((event, idx) => (
                <div
                  key={idx}
                  className={`w-1 h-1 rounded-full ${
                    event.status === 'completed' ? 'bg-green-500' :
                    event.status === 'overdue' ? 'bg-red-500' :
                    event.status === 'due' ? 'bg-yellow-500' : 'bg-petrol-light'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )
    }

    return days
  }

  const getUpcomingEvents = () => {
    const now = new Date()
    return events
      .filter(event => event.date >= now)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 3)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  if (loading) {
    return (
      <Card className={`${className} card-modern`}>
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-normal text-foreground flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="h-6 w-6 text-primary" />
              <span>VAT Calendar</span>
            </div>
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-48 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-8 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`${className} card-modern hover-lift`}>
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-normal text-foreground flex items-center space-x-2">
          <CalendarIcon className="h-6 w-6 text-primary" />
          <span>VAT Calendar</span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">Important dates and deadlines</p>
      </CardHeader>
      <CardContent>
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateMonth('prev')}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-normal text-foreground">
            {getMonthName(currentDate)}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateMonth('next')}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Calendar Grid */}
        <div className="mb-6">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <div key={day} className="h-6 text-xs font-normal text-muted-foreground text-center">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1">
            {renderCalendarDays()}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="space-y-3">
          <h4 className="text-sm font-normal text-foreground">Upcoming Events</h4>
          
          {getUpcomingEvents().length > 0 ? (
            <div className="space-y-2">
              {getUpcomingEvents().map(event => (
                <div
                  key={event.id}
                  className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => {
                    if (event.type === 'deadline') {
                      window.location.href = '/vat-period'
                    }
                  }}
                >
                  <div className={`p-1 rounded ${getEventColor(event.status)}`}>
                    {getEventIcon(event.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h5 className="text-sm font-normal text-foreground truncate">
                        {event.title}
                      </h5>
                      <span className="text-xs text-muted-foreground">
                        {event.date.toLocaleDateString('en-IE', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {event.description}
                    </p>
                    {event.amount && (
                      <p className="text-xs font-normal text-primary">
                        {formatCurrency(event.amount)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <CalendarIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No upcoming events</p>
            </div>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs"
            onClick={() => window.location.href = '/tax-calendar-ireland'}
          >
            View Full Calendar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}