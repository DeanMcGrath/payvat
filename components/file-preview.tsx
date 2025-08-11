"use client"

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Download, 
  Eye, 
  AlertTriangle, 
  Shield, 
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  File,
  X
} from 'lucide-react'
// Format file size for display
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

interface FilePreviewProps {
  file: {
    id: string
    name: string
    originalName: string
    size: number
    mimeType: string
    previewUrl?: string
    downloadUrl: string
    scanResult?: string
  }
  onClose?: () => void
  compact?: boolean
}

const FilePreview: React.FC<FilePreviewProps> = ({ file, onClose, compact = false }) => {
  const [imageError, setImageError] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  // Get file type icon
  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return <ImageIcon className="h-5 w-5 text-blue-600" />
    } else if (mimeType.includes('pdf')) {
      return <FileText className="h-5 w-5 text-red-600" />
    } else if (mimeType.includes('spreadsheet') || mimeType.includes('excel') || mimeType.includes('csv')) {
      return <FileSpreadsheet className="h-5 w-5 text-green-600" />
    } else if (mimeType.includes('word') || mimeType.includes('document')) {
      return <FileText className="h-5 w-5 text-blue-600" />
    }
    return <File className="h-5 w-5 text-gray-600" />
  }

  // Get security badge
  const getSecurityBadge = (scanResult?: string) => {
    switch (scanResult) {
      case 'CLEAN':
        return (
          <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
            <Shield className="h-3 w-3 mr-1" />
            Secure
          </Badge>
        )
      case 'SUSPICIOUS':
        return (
          <Badge variant="outline" className="text-yellow-600 border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Suspicious
          </Badge>
        )
      case 'INFECTED':
        return (
          <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Blocked
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="text-gray-600 border-gray-200 bg-gray-50">
            <Shield className="h-3 w-3 mr-1" />
            Scanned
          </Badge>
        )
    }
  }

  // Handle file download
  const handleDownload = async () => {
    if (file.scanResult === 'INFECTED') {
      return // Don't allow download of infected files
    }

    setIsDownloading(true)
    try {
      const response = await fetch(`${file.downloadUrl}?download=true`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = file.originalName
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        console.error('Download failed:', response.statusText)
      }
    } catch (error) {
      console.error('Download error:', error)
    } finally {
      setIsDownloading(false)
    }
  }

  // Handle file view
  const handleView = () => {
    window.open(file.downloadUrl, '_blank')
  }

  if (compact) {
    return (
      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex-shrink-0">
          {getFileIcon(file.mimeType)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <p className="text-sm font-medium text-gray-900 truncate">
              {file.originalName}
            </p>
            {getSecurityBadge(file.scanResult)}
          </div>
          <p className="text-xs text-gray-500">
            {formatFileSize(file.size)}
          </p>
        </div>
        <div className="flex space-x-2">
          {file.mimeType.startsWith('image/') && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleView}
              className="hover:bg-blue-50"
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            disabled={isDownloading || file.scanResult === 'INFECTED'}
            className="hover:bg-green-50"
          >
            {isDownloading ? (
              <div className="h-4 w-4 border-2 border-gray-300 border-t-2 border-t-blue-600 rounded-full animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {getFileIcon(file.mimeType)}
          <div>
            <h3 className="text-sm font-medium text-gray-900 truncate max-w-64">
              {file.originalName}
            </h3>
            <p className="text-xs text-gray-500">
              {formatFileSize(file.size)} • {file.mimeType.split('/')[1]?.toUpperCase()}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getSecurityBadge(file.scanResult)}
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Preview Content */}
      <div className="p-4">
        {file.mimeType.startsWith('image/') && file.previewUrl && !imageError ? (
          <div className="mb-4">
            <img
              src={file.previewUrl}
              alt={file.originalName}
              className="max-w-full max-h-64 mx-auto rounded border border-gray-200"
              onError={() => setImageError(true)}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-32 bg-gray-50 rounded border-2 border-dashed border-gray-200 mb-4">
            <div className="text-center">
              {getFileIcon(file.mimeType)}
              <p className="text-sm text-gray-500 mt-2">Preview not available</p>
            </div>
          </div>
        )}

        {/* Security Warning */}
        {file.scanResult === 'SUSPICIOUS' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800">Security Warning</p>
                <p className="text-sm text-yellow-700">
                  This file has been flagged as suspicious. Exercise caution when downloading.
                </p>
              </div>
            </div>
          </div>
        )}

        {file.scanResult === 'INFECTED' && (
          <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">File Blocked</p>
                <p className="text-sm text-red-700">
                  This file has been blocked due to security threats and cannot be downloaded.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-3">
          {(file.mimeType.startsWith('image/') || file.mimeType === 'application/pdf') && (
            <Button
              variant="outline"
              onClick={handleView}
              className="flex-1 hover:bg-blue-50"
            >
              <Eye className="h-4 w-4 mr-2" />
              View
            </Button>
          )}
          <Button
            onClick={handleDownload}
            disabled={isDownloading || file.scanResult === 'INFECTED'}
            className="flex-1"
          >
            {isDownloading ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-2 border-t-transparent rounded-full animate-spin mr-2" />
                Downloading...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Download
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default FilePreview