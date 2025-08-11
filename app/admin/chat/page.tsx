"use client"

import { useState, useEffect, useRef, useCallback } from "react"
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
  Loader2,
  Paperclip,
  AlertCircle
} from 'lucide-react'
import AdminRoute from "@/components/admin-route"
import FilePreview from "@/components/file-preview"

interface ChatMessage {
  id: string
  message: string
  senderType: 'user' | 'admin' | 'system'
  senderName: string
  createdAt: string
  isRead: boolean
  messageType?: string
  file?: {
    id: string
    name: string
    originalName: string
    size: number
    mimeType: string
    previewUrl?: string
    downloadUrl: string
    scanResult?: string
  }
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
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load chat sessions
  const loadSessions = useCallback(async () => {
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
  }, [statusFilter])

  // Load messages for selected session
  const loadMessages = async (sessionId: string) => {
    setIsLoadingMessages(true)
    try {
      const response = await fetch(`/api/admin/chat?sessionId=${sessionId}`)
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

  // Client-side file validation for admin
  const validateFileClient = (file: File) => {
    const maxSize = 10 * 1024 * 1024 // 10MB
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/png',
      'image/jpeg',
      'image/jpg',
      'text/csv'
    ]

    if (file.size > maxSize) {
      return { isValid: false, error: `File too large. Maximum size is 10MB (file is ${Math.round(file.size / 1024 / 1024)}MB)` }
    }

    if (!allowedTypes.includes(file.type)) {
      return { isValid: false, error: `File type not supported. Allowed: PDF, DOC, DOCX, XLS, XLSX, PNG, JPG, CSV` }
    }

    return { isValid: true }
  }

  // Send admin file
  const sendFile = async (file: File) => {
    if (!selectedSession) return

    // Client-side validation first
    const validation = validateFileClient(file)
    if (!validation.isValid) {
      setUploadError(validation.error || 'File validation failed')
      return
    }

    setIsUploading(true)
    setUploadError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('sessionId', selectedSession.sessionId)
      formData.append('message', replyMessage || `Admin shared file: ${file.name}`)

      const response = await fetch('/api/chat/files/upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (data.success) {
        // Add the file message to chat
        setMessages(prev => [...prev, data.message])
        setReplyMessage("") // Clear text message
        loadSessions() // Refresh sessions
      } else {
        setUploadError(data.error || 'Failed to upload file')
      }
    } catch (error) {
      console.error('Admin file upload error:', error)
      setUploadError('Network error during file upload')
    } finally {
      setIsUploading(false)
    }
  }

  // Handle file input change
  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      sendFile(files[0])
    }
    // Clear the input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
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
  }, [loadSessions])

  // Auto-refresh sessions every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isLoading) {
        loadSessions()
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [isLoading, loadSessions])

  // Load messages when session is selected
  useEffect(() => {
    if (selectedSession) {
      loadMessages(selectedSession.sessionId)
    }
  }, [selectedSession])

  // Auto-refresh messages every 10 seconds when a session is active
  useEffect(() => {
    if (selectedSession && !selectedSession.isResolved) {
      const interval = setInterval(() => {
        if (!isLoadingMessages) {
          loadMessages(selectedSession.sessionId)
        }
      }, 10000)

      return () => clearInterval(interval)
    }
  }, [selectedSession, isLoadingMessages])

  return (
    <AdminRoute requiredRole="ADMIN">
      <div className="min-h-screen bg-gray-100">
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
                        <Loader2 className="h-6 w-6 animate-spin text-teal-500" />
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
                          className={`border-b p-4 cursor-pointer hover:bg-gray-100 ${
                            selectedSession?.id === session.id ? 'bg-teal-50 border-l-4 border-l-teal-500' : ''
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
                                <Badge variant="default" className="text-xs bg-teal-500">
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
                          <Loader2 className="h-6 w-6 animate-spin text-teal-500" />
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
                                    ? 'bg-teal-100 text-gray-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {/* Handle file messages */}
                                {msg.messageType === 'file' && msg.file ? (
                                  <div className="space-y-2">
                                    {msg.message && !msg.message.includes(`file: ${msg.file.originalName}`) && (
                                      <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                                    )}
                                    {/* File preview */}
                                    <div className={`${msg.senderType === 'admin' ? '' : 'bg-white rounded p-2'}`}>
                                      <FilePreview file={msg.file} compact={true} />
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                                )}
                                
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
                        {/* Upload Error Display */}
                        {uploadError && (
                          <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600 flex items-start space-x-2">
                            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p>{uploadError}</p>
                              <button 
                                onClick={() => setUploadError(null)}
                                className="text-red-700 underline text-xs hover:text-red-800"
                              >
                                Dismiss
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Upload Progress */}
                        {isUploading && (
                          <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-600 flex items-center space-x-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Uploading file...</span>
                          </div>
                        )}

                        <div className="flex space-x-2">
                          <input
                            ref={fileInputRef}
                            type="file"
                            onChange={handleFileInputChange}
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.csv"
                            className="hidden"
                          />
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isSending || isUploading}
                            className="hover:bg-gray-50"
                            title="Attach file"
                          >
                            <Paperclip className="h-4 w-4" />
                          </Button>

                          <Input
                            value={replyMessage}
                            onChange={(e) => setReplyMessage(e.target.value)}
                            placeholder="Type your reply..."
                            className="flex-1"
                            onKeyPress={(e) => e.key === 'Enter' && sendReply()}
                            disabled={isSending || isUploading}
                          />
                          
                          <Button 
                            onClick={sendReply} 
                            disabled={isSending || isUploading || !replyMessage.trim()}
                            className="bg-blue-500 hover:bg-blue-600"
                          >
                            {isSending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Send className="h-4 w-4" />
                            )}
                          </Button>
                        </div>

                        {/* File Upload Hint */}
                        <p className="text-xs text-gray-400 mt-2">
                          Click 📎 to attach files • PDF, DOC, XLS, Images, CSV • Max 10MB
                        </p>
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