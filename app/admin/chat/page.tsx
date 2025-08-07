"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// Removed unused Tabs import
import { 
  MessageCircle, 
  Send, 
  Clock, 
  CheckCircle, 
  User, 
  Building, 
  RefreshCw,
  MoreVertical,
  X,
  Loader2
} from 'lucide-react'
import AdminRoute from "@/components/admin-route"

interface ChatMessage {
  id: string
  message: string
  senderType: 'user' | 'admin' | 'system'
  senderName: string
  createdAt: string
  isRead: boolean
}

interface ChatSession {
  id: string
  sessionId: string
  isActive: boolean
  isResolved: boolean
  resolvedAt?: string
  userEmail?: string
  userName?: string
  userCompany?: string
  messageCount: number
  lastMessage?: ChatMessage
  lastMessageAt: string
  createdAt: string
}

function AdminChatPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [replyMessage, setReplyMessage] = useState("")
  const [statusFilter, setStatusFilter] = useState("active")
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load chat sessions
  const loadSessions = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/chat?status=${statusFilter}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setSessions(data.sessions)
        }
      }
    } catch (error) {
      console.error('Failed to load sessions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Load messages for selected session
  const loadMessages = async (sessionId: string) => {
    setIsLoadingMessages(true)
    try {
      const response = await fetch(`/api/chat?sessionId=${sessionId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setMessages(data.messages)
        }
      }
    } catch (error) {
      console.error('Failed to load messages:', error)
    } finally {
      setIsLoadingMessages(false)
    }
  }

  // Send admin reply
  const sendReply = async () => {
    if (!replyMessage.trim() || !selectedSession || isSending) return

    const messageText = replyMessage.trim()
    setReplyMessage("")
    setIsSending(true)

    try {
      const response = await fetch('/api/admin/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_message',
          sessionId: selectedSession.sessionId,
          message: messageText,
          messageType: 'text',
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          // Add the sent message to the chat
          setMessages(prev => [...prev, data.message])
          
          // Refresh sessions list to update unread counts
          loadSessions()
        }
      } else {
        // Re-add message to input if failed
        setReplyMessage(messageText)
      }
    } catch (error) {
      // Re-add message to input if failed
      setReplyMessage(messageText)
      console.error('Failed to send reply:', error)
    } finally {
      setIsSending(false)
    }
  }

  // Mark session as resolved
  const resolveSession = async (sessionId: string) => {
    try {
      const response = await fetch('/api/admin/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_session',
          sessionId,
          isResolved: true,
          isActive: false,
        })
      })

      if (response.ok) {
        // Refresh sessions
        loadSessions()
        
        // Clear selected session if it was resolved
        if (selectedSession?.sessionId === sessionId) {
          setSelectedSession(null)
          setMessages([])
        }
      }
    } catch (error) {
      console.error('Failed to resolve session:', error)
    }
  }

  // Load sessions on mount and filter change
  useEffect(() => {
    loadSessions()
  }, [statusFilter])

  // Load messages when session is selected
  useEffect(() => {
    if (selectedSession) {
      loadMessages(selectedSession.sessionId)
    }
  }, [selectedSession])

  return (
    <AdminRoute requiredRole="ADMIN">
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Live Chat Management</h1>
            <p className="text-gray-600">Respond to customer inquiries and manage chat sessions</p>
          </div>

          <div className="grid grid-cols-12 gap-6 h-[800px]">
            {/* Sessions List */}
            <div className="col-span-4">
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Chat Sessions</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={loadSessions}
                      disabled={isLoading}
                    >
                      <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active Chats</SelectItem>
                      <SelectItem value="resolved">Resolved Chats</SelectItem>
                      <SelectItem value="all">All Chats</SelectItem>
                    </SelectContent>
                  </Select>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-0 max-h-[650px] overflow-y-auto">
                    {isLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
                      </div>
                    ) : sessions.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No chat sessions found</p>
                      </div>
                    ) : (
                      sessions.map((session) => (
                        <div
                          key={session.id}
                          className={`border-b p-4 cursor-pointer hover:bg-gray-50 ${
                            selectedSession?.id === session.id ? 'bg-emerald-50 border-l-4 border-l-emerald-500' : ''
                          }`}
                          onClick={() => setSelectedSession(session)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                                <User className="h-4 w-4 text-gray-600" />
                              </div>
                              <div>
                                <p className="font-medium text-sm">
                                  {session.userName || 'Anonymous User'}
                                </p>
                                {session.userEmail && (
                                  <p className="text-xs text-gray-500">{session.userEmail}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {session.isResolved ? (
                                <Badge variant="secondary" className="text-xs">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Resolved
                                </Badge>
                              ) : session.isActive ? (
                                <Badge variant="default" className="text-xs bg-emerald-500">
                                  <Clock className="h-3 w-3 mr-1" />
                                  Active
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-xs">
                                  Idle
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          {session.lastMessage && (
                            <p className="text-sm text-gray-600 truncate mb-2">
                              {session.lastMessage.message}
                            </p>
                          )}
                          
                          <div className="flex items-center justify-between text-xs text-gray-400">
                            <span>{session.messageCount} messages</span>
                            <span>
                              {new Date(session.lastMessageAt).toLocaleDateString('en-IE')}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Chat Area */}
            <div className="col-span-8">
              {selectedSession ? (
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          Chat with {selectedSession.userName || 'Anonymous User'}
                        </CardTitle>
                        <p className="text-sm text-gray-500">
                          {selectedSession.userEmail && (
                            <span className="mr-4">{selectedSession.userEmail}</span>
                          )}
                          {selectedSession.userCompany && (
                            <span className="inline-flex items-center">
                              <Building className="h-3 w-3 mr-1" />
                              {selectedSession.userCompany}
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {!selectedSession.isResolved && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => resolveSession(selectedSession.sessionId)}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Mark Resolved
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col h-full p-0">
                    <div className="flex-1 p-4 overflow-y-auto">
                      {isLoadingMessages ? (
                        <div className="flex items-center justify-center h-full">
                          <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
                          <span className="ml-2 text-sm text-gray-600">Loading messages...</span>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {messages.map((msg) => (
                            <div
                              key={msg.id}
                              className={`flex ${
                                msg.senderType === 'admin' ? 'justify-end' : 'justify-start'
                              }`}
                            >
                              <div
                                className={`rounded-lg p-3 max-w-[70%] ${
                                  msg.senderType === 'admin'
                                    ? 'bg-blue-500 text-white'
                                    : msg.senderType === 'user'
                                    ? 'bg-emerald-100 text-gray-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                                <div className="mt-1 text-xs opacity-75">
                                  <span>{msg.senderName}</span>
                                  <span className="ml-2">
                                    {new Date(msg.createdAt).toLocaleTimeString('en-IE', { 
                                      hour: '2-digit', 
                                      minute: '2-digit' 
                                    })}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                          <div ref={messagesEndRef} />
                        </div>
                      )}
                    </div>
                    
                    {/* Reply Input */}
                    {!selectedSession.isResolved && (
                      <div className="border-t p-4">
                        <div className="flex space-x-2">
                          <Input
                            value={replyMessage}
                            onChange={(e) => setReplyMessage(e.target.value)}
                            placeholder="Type your reply..."
                            className="flex-1"
                            onKeyPress={(e) => e.key === 'Enter' && sendReply()}
                            disabled={isSending}
                          />
                          <Button 
                            onClick={sendReply} 
                            disabled={isSending || !replyMessage.trim()}
                            className="bg-blue-500 hover:bg-blue-600"
                          >
                            {isSending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Send className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card className="h-full">
                  <CardContent className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Select a chat session
                      </h3>
                      <p className="text-gray-500">
                        Choose a chat from the left to start responding to customers
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminRoute>
  )
}

export default AdminChatPage