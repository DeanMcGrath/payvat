"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MessageCircle, X, Send } from 'lucide-react'

export default function LiveChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState("")

  const toggleChat = () => {
    setIsOpen(!isOpen)
  }

  const sendMessage = () => {
    if (message.trim()) {
      // Handle message sending logic here
      setMessage("")
    }
  }

  return (
    <>
      {/* Chat Widget */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 w-80 h-96 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
          <Card className="h-full">
            <CardHeader className="bg-emerald-500 text-white rounded-t-lg">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Live Chat Support</CardTitle>
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
                <div className="space-y-4">
                  <div className="bg-gray-100 rounded-lg p-3">
                    <p className="text-sm text-gray-800">
                      <strong>Support Team:</strong> Hi! How can we help you with your VAT submission today?
                    </p>
                  </div>
                </div>
              </div>
              <div className="border-t p-4">
                <div className="flex space-x-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  />
                  <Button onClick={sendMessage} size="sm" className="bg-emerald-500 hover:bg-emerald-600">
                    <Send className="h-4 w-4" />
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
