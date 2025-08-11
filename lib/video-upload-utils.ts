// Video upload utilities for client-side validation and chunked uploads

export interface VideoFile {
  file: File
  title: string
  description?: string
}

export interface UploadProgress {
  chunksUploaded: number
  totalChunks: number
  percentage: number
  bytesUploaded: number
  totalBytes: number
  status: 'preparing' | 'uploading' | 'processing' | 'completed' | 'error'
  message?: string
}

export interface UploadOptions {
  chunkSize?: number // Default 5MB chunks
  maxRetries?: number // Default 3 retries per chunk
  onProgress?: (progress: UploadProgress) => void
  onError?: (error: string) => void
}

// Constants
const DEFAULT_CHUNK_SIZE = 5 * 1024 * 1024 // 5MB chunks
const MAX_FILE_SIZE = 500 * 1024 * 1024 // 500MB max
const MIN_CHUNKED_SIZE = 50 * 1024 * 1024 // Use chunked upload for files >50MB

// Supported video formats
const SUPPORTED_VIDEO_TYPES = [
  'video/mp4',
  'video/mov', 
  'video/avi',
  'video/quicktime',
  'video/webm',
  'video/x-msvideo'
]

const SUPPORTED_EXTENSIONS = ['.mp4', '.mov', '.avi', '.webm', '.qt']

/**
 * Validate video file before upload
 */
export function validateVideoFile(file: File): { isValid: boolean; error?: string } {
  // Check if file exists
  if (!file) {
    return { isValid: false, error: 'No file selected' }
  }

  // Check file size
  if (file.size === 0) {
    return { isValid: false, error: 'File is empty' }
  }

  if (file.size > MAX_FILE_SIZE) {
    const sizeMB = Math.round(file.size / 1024 / 1024)
    return { 
      isValid: false, 
      error: `File is too large (${sizeMB}MB). Maximum size is 500MB.` 
    }
  }

  // Check file type
  const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
  const isValidType = SUPPORTED_VIDEO_TYPES.includes(file.type.toLowerCase())
  const isValidExtension = SUPPORTED_EXTENSIONS.includes(fileExtension)

  if (!isValidType && !isValidExtension) {
    return { 
      isValid: false, 
      error: `Unsupported file format. Supported formats: MP4, MOV, AVI, WebM (detected: ${file.type || 'unknown'})` 
    }
  }

  return { isValid: true }
}

/**
 * Check if file should use chunked upload
 */
export function shouldUseChunkedUpload(file: File): boolean {
  return file.size > MIN_CHUNKED_SIZE
}

/**
 * Upload video file (automatically chooses chunked or standard upload)
 */
export async function uploadVideoFile(
  videoFile: VideoFile,
  options: UploadOptions = {}
): Promise<any> {
  const { file, title, description } = videoFile
  const {
    chunkSize = DEFAULT_CHUNK_SIZE,
    maxRetries = 3,
    onProgress,
    onError
  } = options

  // Validate file
  const validation = validateVideoFile(file)
  if (!validation.isValid) {
    onError?.(validation.error!)
    throw new Error(validation.error)
  }

  // Report initial progress
  onProgress?.({
    chunksUploaded: 0,
    totalChunks: 1,
    percentage: 0,
    bytesUploaded: 0,
    totalBytes: file.size,
    status: 'preparing',
    message: 'Preparing upload...'
  })

  // Choose upload method
  if (shouldUseChunkedUpload(file)) {
    return await uploadVideoChunked(file, title, description, {
      chunkSize,
      maxRetries,
      onProgress,
      onError
    })
  } else {
    return await uploadVideoStandard(file, title, description, onProgress, onError)
  }
}

/**
 * Standard upload for smaller files
 */
async function uploadVideoStandard(
  file: File,
  title: string,
  description?: string,
  onProgress?: (progress: UploadProgress) => void,
  onError?: (error: string) => void
): Promise<any> {
  try {
    onProgress?.({
      chunksUploaded: 0,
      totalChunks: 1,
      percentage: 0,
      bytesUploaded: 0,
      totalBytes: file.size,
      status: 'uploading',
      message: 'Uploading video...'
    })

    const formData = new FormData()
    formData.append('video', file)
    formData.append('title', title)
    if (description) {
      formData.append('description', description)
    }

    const response = await fetch('/api/admin/videos', {
      method: 'POST',
      body: formData,
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || `Upload failed with status ${response.status}`)
    }

    onProgress?.({
      chunksUploaded: 1,
      totalChunks: 1,
      percentage: 100,
      bytesUploaded: file.size,
      totalBytes: file.size,
      status: 'completed',
      message: 'Upload completed successfully'
    })

    return result

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Upload failed'
    onError?.(errorMessage)
    throw error
  }
}

/**
 * Chunked upload for larger files
 */
async function uploadVideoChunked(
  file: File,
  title: string,
  description: string | undefined,
  options: {
    chunkSize: number
    maxRetries: number
    onProgress?: (progress: UploadProgress) => void
    onError?: (error: string) => void
  }
): Promise<any> {
  const { chunkSize, maxRetries, onProgress, onError } = options
  const sessionId = generateSessionId()
  const totalChunks = Math.ceil(file.size / chunkSize)

  try {
    onProgress?.({
      chunksUploaded: 0,
      totalChunks,
      percentage: 0,
      bytesUploaded: 0,
      totalBytes: file.size,
      status: 'uploading',
      message: `Uploading video in ${totalChunks} chunks...`
    })

    // Upload chunks
    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const start = chunkIndex * chunkSize
      const end = Math.min(start + chunkSize, file.size)
      const chunk = file.slice(start, end)

      let retries = 0
      while (retries < maxRetries) {
        try {
          await uploadChunk({
            sessionId,
            chunkIndex,
            totalChunks,
            totalSize: file.size,
            fileName: file.name,
            title,
            description,
            mimeType: file.type,
            chunk
          })

          // Update progress
          const bytesUploaded = (chunkIndex + 1) * chunkSize
          const percentage = Math.round(((chunkIndex + 1) / totalChunks) * 100)
          
          onProgress?.({
            chunksUploaded: chunkIndex + 1,
            totalChunks,
            percentage,
            bytesUploaded: Math.min(bytesUploaded, file.size),
            totalBytes: file.size,
            status: chunkIndex + 1 === totalChunks ? 'processing' : 'uploading',
            message: chunkIndex + 1 === totalChunks 
              ? 'Processing video...' 
              : `Uploading chunk ${chunkIndex + 1} of ${totalChunks}...`
          })

          break // Success, exit retry loop

        } catch (error) {
          retries++
          if (retries >= maxRetries) {
            throw new Error(`Failed to upload chunk ${chunkIndex + 1} after ${maxRetries} retries`)
          }
          
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * 1000))
        }
      }
    }

    // Final upload should return the complete video info
    const finalResponse = await fetch(`/api/admin/videos/chunked?sessionId=${sessionId}`)
    const result = await finalResponse.json()

    if (!finalResponse.ok) {
      throw new Error(result.error || 'Failed to finalize chunked upload')
    }

    onProgress?.({
      chunksUploaded: totalChunks,
      totalChunks,
      percentage: 100,
      bytesUploaded: file.size,
      totalBytes: file.size,
      status: 'completed',
      message: 'Upload completed successfully'
    })

    return result

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Chunked upload failed'
    onError?.(errorMessage)
    throw error
  }
}

/**
 * Upload a single chunk
 */
async function uploadChunk(chunkData: {
  sessionId: string
  chunkIndex: number
  totalChunks: number
  totalSize: number
  fileName: string
  title: string
  description?: string
  mimeType: string
  chunk: Blob
}): Promise<void> {
  const formData = new FormData()
  formData.append('sessionId', chunkData.sessionId)
  formData.append('chunkIndex', chunkData.chunkIndex.toString())
  formData.append('totalChunks', chunkData.totalChunks.toString())
  formData.append('totalSize', chunkData.totalSize.toString())
  formData.append('fileName', chunkData.fileName)
  formData.append('title', chunkData.title)
  formData.append('mimeType', chunkData.mimeType)
  formData.append('chunk', chunkData.chunk)
  
  if (chunkData.description) {
    formData.append('description', chunkData.description)
  }

  const response = await fetch('/api/admin/videos/chunked', {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || `Chunk upload failed with status ${response.status}`)
  }
}

/**
 * Generate a unique session ID
 */
function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Get video file info for display
 */
export function getVideoFileInfo(file: File) {
  return {
    name: file.name,
    size: formatFileSize(file.size),
    type: file.type,
    lastModified: new Date(file.lastModified),
    useChunkedUpload: shouldUseChunkedUpload(file)
  }
}