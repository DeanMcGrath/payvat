"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MessageCircle, X, Send, Loader2, Bot, ThumbsUp, ThumbsDown, Paperclip, Upload, AlertCircle } from 'lucide-react'
import FilePreview from "@/components/file-preview"

interface ChatMessage {
  id: string
  message: string
  senderType: 'user' | 'admin' | 'system'
  senderName: string
  createdAt: string
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
}

export default function LiveChat() {
  const [isOpen, setIsOpen] = useState(() => {
    // Initialize from localStorage on client-side only
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('chat_is_open')
      return stored === 'true'
    }
    return false
  })
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [session, setSession] = useState<ChatSession | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load messages for session
  const loadMessages = useCallback(async (sessionId: string) => {
    try {
      const response = await fetch(`/api/chat?sessionId=${sessionId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.messages) {
          setMessages(data.messages)
        }
      }
    } catch (error) {
      console.error('Failed to load messages:', error)
    }
  }, [])

  // Initialize or load chat session
  const initializeChat = useCallback(async () => {
    setIsLoading(true)
    try {
      // Check if we have a stored session
      const storedSessionId = localStorage.getItem('chat_session_id')
      
      if (storedSessionId) {
        // Try to load existing session
        const response = await fetch(`/api/chat?sessionId=${storedSessionId}`)
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setSession(data.session)
            setMessages(data.messages)
            return
          }
        }
      }

      // Create new session
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_session',
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setSession(data.session)
          localStorage.setItem('chat_session_id', data.session.sessionId)
          
          // Load initial messages
          loadMessages(data.session.sessionId)
        }
      }
    } catch (error) {
      console.error('Failed to initialize chat:', error)
    } finally {
      setIsLoading(false)
    }
  }, [loadMessages])

  // Persist chat open/closed state to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('chat_is_open', isOpen.toString())
    }
  }, [isOpen])

  // Auto-initialize chat if it was previously open
  useEffect(() => {
    if (isOpen && !session) {
      initializeChat()
    }
  }, [isOpen, session, initializeChat])

  // Send message
  const sendMessage = async () => {
    if (!message.trim() || !session || isSending) return

    const messageText = message.trim()
    setMessage("")
    setIsSending(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_message',
          sessionId: session.sessionId,
          message: messageText,
          messageType: 'text',
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          // Add the sent message to the chat
          setMessages(prev => [...prev, data.message])
          
          // If there's an AI response, add it immediately
          if (data.aiResponse) {
            setMessages(prev => [...prev, {
              id: data.aiResponse.id,
              message: data.aiResponse.message,
              senderType: 'admin', // Treat AI as admin for styling
              senderName: data.aiResponse.senderName,
              createdAt: data.aiResponse.createdAt,
              messageType: 'text'
            }])
          }
          
          // Still poll for any additional responses after a short delay
          setTimeout(() => {
            loadMessages(session.sessionId)
          }, 1000)
        }
      } else {
        // Re-add message to input if failed
        setMessage(messageText)
        console.error('Failed to send message')
      }
    } catch (error) {
      // Re-add message to input if failed
      setMessage(messageText)
      console.error('Failed to send message:', error)
    } finally {
      setIsSending(false)
    }
  }

  // Client-side file validation
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

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    if (!session) return

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
      formData.append('sessionId', session.sessionId)
      formData.append('message', message || `Shared file: ${file.name}`)

      const response = await fetch('/api/chat/files/upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (data.success) {
        // Add the file message to chat
        setMessages(prev => [...prev, data.message])
        setMessage("") // Clear text message if file was uploaded with text
      } else {
        setUploadError(data.error || 'Failed to upload file')
      }
    } catch (error) {
      console.error('File upload error:', error)
      setUploadError('Network error during file upload')
    } finally {
      setIsUploading(false)
    }
  }

  // Handle file input change
  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      handleFileUpload(files[0])
    }
    // Clear the input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Handle drag and drop
  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(false)
    
    const files = event.dataTransfer.files
    if (files && files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  // Handle opening chat
  const toggleChat = () => {
    if (!isOpen && !session) {
      // Initialize chat when first opening
      initializeChat()
    }
    setIsOpen(!isOpen)
  }

  return (
    <>
      {/* Chat Widget */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 w-80 h-96 max-w-[calc(100vw-2rem)] max-h-[calc(100vh-6rem)] bg-white border border-gray-200 rounded-lg shadow-xl z-[9999]">
          {/* Drag and Drop Overlay */}
          {isDragOver && (
            <div className="absolute inset-0 bg-[#0085D1] bg-opacity-20 border-2 border-dashed border-teal-400 rounded-lg flex items-center justify-center z-10">
              <div className="text-center text-blue-600">
                <Upload className="h-8 w-8 mx-auto mb-2" />
                <p className="font-semibold">Drop file to upload</p>
                <p className="text-sm">PDF, DOC, XLS, Images, CSV</p>
              </div>
            </div>
          )}

          <Card className="h-full" onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
            <CardHeader className="bg-[#0085D1] text-white rounded-t-lg">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">
                  Live Chat Support
                  {session && (
                    <span className="text-xs font-normal opacity-80 block">
                      {session.isActive ? 'Online' : 'Offline'}
                    </span>
                  )}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleChat}
                  className="text-white hover:bg-[#0072B1]"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col h-full p-0">
              <div className="flex-1 p-4 overflow-y-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                    <span className="ml-2 text-sm text-gray-600">Connecting...</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((msg) => {
                      const isAI = msg.senderName?.includes('🤖') || msg.senderName?.includes('Assistant')
                      const isFileMessage = msg.messageType === 'file' && msg.file
                      
                      return (
                        <div
                          key={msg.id}
                          className={`rounded-lg p-3 max-w-[85%] ${
                            msg.senderType === 'user'
                              ? 'bg-[#0085D1] text-white ml-auto'
                              : msg.senderType === 'admin'
                              ? isAI 
                                ? 'bg-gradient-to-r from-teal-50 to-slate-50 text-gray-800 border border-blue-200'
                                : 'bg-blue-100 text-gray-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          <div className="flex items-start space-x-2">
                            {isAI && (
                              <Bot className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            )}
                            <div className="flex-1">
                              {/* Text message */}
                              {!isFileMessage ? (
                                <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                              ) : (
                                <div className="space-y-2">
                                  {msg.message && msg.message !== `Shared file: ${msg.file?.originalName}` && (
                                    <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                                  )}
                                  {/* File preview */}
                                  <div className={`${msg.senderType === 'user' ? '' : 'bg-white rounded p-2'}`}>
                                    <FilePreview file={msg.file!} compact={true} />
                                  </div>
                                </div>
                              )}
                              
                              <div className="mt-1 text-xs opacity-75 flex items-center justify-between">
                                <div>
                                  <span>{msg.senderName}</span>
                                  <span className="ml-2">
                                    {new Date(msg.createdAt).toLocaleTimeString('en-IE', { 
                                      hour: '2-digit', 
                                      minute: '2-digit' 
                                    })}
                                  </span>
                                </div>
                                {isAI && msg.senderType !== 'user' && (
                                  <div className="flex space-x-1 ml-2">
                                    <button 
                                      className="text-green-600 hover:text-green-700 transition-colors"
                                      title="Helpful response"
                                    >
                                      <ThumbsUp className="h-3 w-3" />
                                    </button>
                                    <button 
                                      className="text-red-600 hover:text-red-700 transition-colors"
                                      title="Not helpful"
                                    >
                                      <ThumbsDown className="h-3 w-3" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>
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

                {/* Input Area */}
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
                    disabled={isLoading || isSending || isUploading || !session}
                    className="hover:bg-gray-50"
                    title="Attach file"
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>

                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    disabled={isLoading || isSending || isUploading || !session}
                  />
                  
                  <Button 
                    onClick={sendMessage} 
                    size="sm" 
                    className="bg-[#0085D1] hover:bg-[#0072B1]"
                    disabled={isLoading || isSending || isUploading || !session || !message.trim()}
                  >
                    {isSending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {/* File Upload Hint */}
                {!isLoading && session && (
                  <p className="text-xs text-gray-400 mt-2 text-center">
                    Drag & drop files or click 📎 • PDF, DOC, XLS, Images, CSV • Max 10MB
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Chat Button */}
      <Button
        onClick={toggleChat}
        className="fixed bottom-4 right-4 w-14 h-14 rounded-full bg-[#0085D1] hover:bg-[#0072B1] text-white shadow-lg z-[9998] transition-all duration-200 hover:scale-110 sm:w-14 sm:h-14"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    </>
  )
}
