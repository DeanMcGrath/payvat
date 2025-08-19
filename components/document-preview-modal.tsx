"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FileText, Download, Calendar, FileType, Folder, Save, X } from "lucide-react"
import { type Document } from "@/components/document-list"

interface DocumentPreviewModalProps {
  document: Document | null
  isOpen: boolean
  onClose: () => void
  onUpdate: (document: Document) => void
  onDownload: (document: Document) => void
}

export default function DocumentPreviewModal({
  document,
  isOpen,
  onClose,
  onUpdate,
  onDownload
}: DocumentPreviewModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedDocument, setEditedDocument] = useState<Document | null>(null)

  if (!document) return null

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getFileTypeIcon = (fileType: string) => {
    const type = fileType.toLowerCase()
    if (type === 'pdf') return <FileText className="h-5 w-5 text-red-500" />
    if (type === 'xlsx' || type === 'xls') return <FileText className="h-5 w-5 text-green-500" />
    if (type === 'csv') return <FileText className="h-5 w-5 text-blue-500" />
    return <FileText className="h-5 w-5 text-gray-500" />
  }

  const getTypeBadge = (type: string) => {
    return type === 'sales' ? (
      <Badge variant="secondary" className="bg-green-100 text-green-700">
        Sales
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-red-100 text-red-700">
        Purchases
      </Badge>
    )
  }

  const handleEdit = () => {
    setEditedDocument({ ...document })
    setIsEditing(true)
  }

  const handleSave = () => {
    if (editedDocument) {
      onUpdate(editedDocument)
      setIsEditing(false)
      setEditedDocument(null)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditedDocument(null)
  }

  const handleInputChange = (field: keyof Document, value: string) => {
    if (editedDocument) {
      setEditedDocument({
        ...editedDocument,
        [field]: value
      })
    }
  }

  const currentDocument = editedDocument || document

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center space-x-3">
              {getFileTypeIcon(currentDocument.fileType)}
              <span className="truncate">{currentDocument.name}</span>
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Document Preview Area */}
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center bg-gray-50">
            {getFileTypeIcon(currentDocument.fileType)}
            <div className="mt-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Document Preview</h3>
              <p className="text-gray-500 mb-4">
                Preview for {currentDocument.fileType.toUpperCase()} files is not available in this demo
              </p>
              <Button
                onClick={() => onDownload(currentDocument)}
                className="bg-[#0072B1] hover:bg-[#005a8a] text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                Download to View
              </Button>
            </div>
          </div>

          {/* Document Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Document Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Document Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Document Name</Label>
                {isEditing ? (
                  <Input
                    id="name"
                    value={currentDocument.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                  />
                ) : (
                  <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{currentDocument.name}</span>
                  </div>
                )}
              </div>

              {/* Document Type */}
              <div className="space-y-2">
                <Label htmlFor="type">Document Type</Label>
                {isEditing ? (
                  <Select
                    value={currentDocument.type}
                    onValueChange={(value) => handleInputChange('type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="purchases">Purchases</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                    <Folder className="h-4 w-4 text-gray-500" />
                    {getTypeBadge(currentDocument.type)}
                  </div>
                )}
              </div>

              {/* File Type */}
              <div className="space-y-2">
                <Label htmlFor="fileType">File Type</Label>
                <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                  <FileType className="h-4 w-4 text-gray-500" />
                  <span className="text-sm uppercase">{currentDocument.fileType}</span>
                </div>
              </div>

              {/* File Size */}
              <div className="space-y-2">
                <Label htmlFor="size">File Size</Label>
                <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                  <span className="text-sm">{formatFileSize(currentDocument.size)}</span>
                </div>
              </div>

              {/* Document Date */}
              <div className="space-y-2">
                <Label htmlFor="date">Document Date</Label>
                {isEditing ? (
                  <Input
                    id="date"
                    type="date"
                    value={currentDocument.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                  />
                ) : (
                  <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{formatDate(currentDocument.date)}</span>
                  </div>
                )}
              </div>

              {/* Upload Date */}
              <div className="space-y-2">
                <Label htmlFor="uploadDate">Upload Date</Label>
                <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{formatDate(currentDocument.uploadDate)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <div className="flex space-x-2">
              <Button
                onClick={() => onDownload(currentDocument)}
                variant="outline"
                className="text-[#0072B1] border-[#0072B1] hover:bg-[#0072B1] hover:text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
            
            <div className="flex space-x-2">
              {isEditing ? (
                <>
                  <Button variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} className="bg-[#0072B1] hover:bg-[#005a8a] text-white">
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </>
              ) : (
                <Button onClick={handleEdit} variant="outline">
                  Edit Details
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}