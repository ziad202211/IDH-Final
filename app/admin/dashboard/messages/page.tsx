"use client"

import { useState, useEffect } from "react"
import AdminLayout from "@/components/admin/layout"
import { Button } from "@/components/ui/button"
import { Mail, Check, Trash2 } from "lucide-react"
import type { ContactMessage } from "@/lib/message-service"

export default function MessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMessages()
  }, [])

  const fetchMessages = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/messages")
      const result = await response.json()

      if (result.success && result.data) {
        setMessages(result.data)

        // Select the first message by default if available
        if (result.data.length > 0 && !selectedMessage) {
          setSelectedMessage(result.data[0])
        }
      } else {
        console.error("Error fetching messages:", result.error)
        // Fallback to sample data
        setMessages(getSampleMessages())
        if (!selectedMessage && getSampleMessages().length > 0) {
          setSelectedMessage(getSampleMessages()[0])
        }
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
      // Fallback to sample data
      setMessages(getSampleMessages())
      if (!selectedMessage && getSampleMessages().length > 0) {
        setSelectedMessage(getSampleMessages()[0])
      }
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (id: string) => {
    try {
      const response = await fetch("/api/messages", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, read: true }),
      })

      const result = await response.json()

      if (result.success) {
        // Update the messages list
        setMessages(messages.map((msg) => (msg.id === id ? { ...msg, read: true } : msg)))

        // Update the selected message if it's the one being marked as read
        if (selectedMessage && selectedMessage.id === id) {
          setSelectedMessage({ ...selectedMessage, read: true })
        }
      } else {
        console.error("Error marking message as read:", result.error)
        alert("Failed to mark message as read. Please try again.")
      }
    } catch (error) {
      console.error("Error marking message as read:", error)
      alert("Failed to mark message as read. Please try again.")
    }
  }

  const handleDeleteMessage = async (id: string) => {
    if (!confirm("Are you sure you want to delete this message? This action cannot be undone.")) {
      return
    }

    try {
      const response = await fetch(`/api/messages?id=${id}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (result.success) {
        // Remove the message from the list
        const updatedMessages = messages.filter((msg) => msg.id !== id)
        setMessages(updatedMessages)

        // If the deleted message was selected, select another one
        if (selectedMessage && selectedMessage.id === id) {
          setSelectedMessage(updatedMessages.length > 0 ? updatedMessages[0] : null)
        }
      } else {
        console.error("Error deleting message:", result.error)
        alert("Failed to delete message. Please try again.")
      }
    } catch (error) {
      console.error("Error deleting message:", error)
      alert("Failed to delete message. Please try again.")
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

      if (diffDays === 0) {
        return "Today"
      } else if (diffDays === 1) {
        return "Yesterday"
      } else if (diffDays < 7) {
        return `${diffDays} days ago`
      } else {
        return date.toLocaleDateString()
      }
    } catch (error) {
      return "Invalid date"
    }
  }

  // Sample messages as fallback
  const getSampleMessages = (): ContactMessage[] => [
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      phone: "555-123-4567",
      message:
        "I'm interested in your interior design services for my new home. Could you please provide more information about your process and pricing?",
      read: false,
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "555-987-6543",
      message:
        "We're looking to renovate our office space and would like to discuss your commercial design services. Please contact me at your earliest convenience.",
      read: true,
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    },
    {
      id: "3",
      name: "Michael Johnson",
      email: "michael@example.com",
      phone: null,
      message:
        "I saw your portfolio and I'm impressed with your work. I have a small apartment that needs redesigning. What would be the approximate cost for such a project?",
      read: false,
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    },
  ]

  if (loading) {
    return (
      <AdminLayout>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#636AE8] mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading messages...</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Messages List */}
        <div className="w-full lg:w-1/2 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Contact Messages</h2>
          </div>

          {messages.length === 0 ? (
            <div className="p-8 text-center">
              <Mail className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-500">No messages yet</h3>
              <p className="text-gray-400 mt-2">
                When visitors send messages through the contact form, they'll appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedMessage?.id === message.id ? "bg-gray-50" : ""
                  } ${!message.read ? "border-l-4 border-[#636AE8]" : ""}`}
                  onClick={() => setSelectedMessage(message)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{message.name}</h3>
                      <p className="text-sm text-gray-500">{message.email}</p>
                    </div>
                    <span className="text-xs text-gray-500">{formatDate(message.created_at)}</span>
                  </div>
                  <p className="mt-2 text-gray-600 line-clamp-2">{message.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Message Detail */}
        <div className="w-full lg:w-1/2 bg-white rounded-lg shadow-sm border border-gray-200">
          {selectedMessage ? (
            <div className="h-full flex flex-col">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-semibold">Message Details</h2>
                <div className="flex gap-2">
                  {!selectedMessage.read && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMarkAsRead(selectedMessage.id)}
                      className="flex items-center gap-1"
                    >
                      <Check className="h-4 w-4" />
                      Mark as Read
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteMessage(selectedMessage.id)}
                    className="flex items-center gap-1 text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>

              <div className="p-6 flex-grow">
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500">From</h3>
                  <p className="text-gray-900">
                    {selectedMessage.name} &lt;{selectedMessage.email}&gt;
                  </p>
                  {selectedMessage.phone && <p className="text-gray-600 mt-1">Phone: {selectedMessage.phone}</p>}
                </div>

                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500">Received</h3>
                  <p className="text-gray-900">{new Date(selectedMessage.created_at).toLocaleString()}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Message</h3>
                  <div className="mt-2 p-4 bg-gray-50 rounded-md text-gray-900 whitespace-pre-wrap">
                    {selectedMessage.message}
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center gap-2">
                  <Button className="w-full" onClick={() => (window.location.href = `mailto:${selectedMessage.email}`)}>
                    Reply via Email
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center h-full flex flex-col items-center justify-center">
              <Mail className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-500">No message selected</h3>
              <p className="text-gray-400 mt-2">Select a message from the list to view details</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
