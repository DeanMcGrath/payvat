"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MessageCircle, X, Send, Loader2 } from 'lucide-react'

interface ChatMessage {
  id: string
  message: string
  senderType: 'user' | 'admin' | 'system'
  senderName: string
  createdAt: string
  messageType?: string
}

interface ChatSession {
  id: string
  sessionId: string
  isActive: boolean
}

export default function LiveChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [session, setSession] = useState<ChatSession | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Initialize or load chat session
  const initializeChat = async () => {
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
  }

  // Load messages for session
  const loadMessages = async (sessionId: string) => {
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
    }
  }

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
          
          // Poll for admin response after a short delay
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
        <div className="fixed bottom-20 right-4 w-80 h-96 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
          <Card className="h-full">
            <CardHeader className="bg-emerald-500 text-white rounded-t-lg">
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
                  className="text-white hover:bg-emerald-600"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col h-full p-0">
              <div className="flex-1 p-4 overflow-y-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
                    <span className="ml-2 text-sm text-gray-600">Connecting...</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`rounded-lg p-3 max-w-[85%] ${
                          msg.senderType === 'user'
                            ? 'bg-emerald-500 text-white ml-auto'
                            : msg.senderType === 'admin'
                            ? 'bg-blue-100 text-gray-800'
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
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>
              <div className="border-t p-4">
                <div className="flex space-x-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    disabled={isLoading || isSending || !session}
                  />
                  <Button 
                    onClick={sendMessage} 
                    size="sm" 
                    className="bg-emerald-500 hover:bg-emerald-600"
                    disabled={isLoading || isSending || !session || !message.trim()}
                  >
                    {isSending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Chat Button */}
      <Button
        onClick={toggleChat}
        className="fixed bottom-4 right-4 w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg z-40"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    </>
  )
}
