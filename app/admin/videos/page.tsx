'use client'

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import AdminRoute from '@/components/admin-route'
import { ErrorBoundary } from '@/components/error-boundary'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { VideoAnalytics } from '@/components/video-analytics'
import SiteHeader from '@/components/site-header'
import Footer from '@/components/footer'
import { 
  Upload, 
  Video, 
  Play, 
  Pause,
  Trash2, 
  Edit, 
  Eye,
  Clock,
  Users,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Plus,
  BarChart3
} from 'lucide-react'

interface VideoStats {
  totalViews: number
  uniqueViewers: number
  avgWatchDuration: number
  avgCompletionRate: number
}

interface DemoVideo {
  id: string
  title: string
  description: string | null
  videoUrl: string
  thumbnailUrl: string | null
  status: string
  isActive: boolean
  uploadedAt: string
  fileSize: number
  duration: number | null
  stats: VideoStats
}

interface UploadProgress {
  isUploading: boolean
  progress: number
  status: string
}

export default function AdminVideos() {
  return (
    <AdminRoute requiredRole="ADMIN">
      <ErrorBoundary>
        <AdminVideosContent />
      </ErrorBoundary>
    </AdminRoute>
  )
}

function AdminVideosContent() {
  const [videos, setVideos] = useState<DemoVideo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    isUploading: false,
    progress: 0,
    status: ''
  })
  const [selectedVideoForAnalytics, setSelectedVideoForAnalytics] = useState<string | null>(null)
  
  // Upload form state
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    file: null as File | null
  })

  const fetchVideos = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/admin/videos', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      })
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`)
      }
      
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch videos')
      }
      
      setVideos(data.videos || [])
    } catch (err) {
      console.error('Videos fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load videos')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchVideos()
  }, [fetchVideos])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/quicktime']
      if (!allowedTypes.includes(file.type)) {
        alert('Invalid file type. Only MP4, MOV, and AVI files are supported.')
        return
      }

      // Validate file size (max 500MB)
      const maxSize = 500 * 1024 * 1024
      if (file.size > maxSize) {
        alert('File size too large. Maximum size is 500MB.')
        return
      }

      setUploadForm(prev => ({ ...prev, file }))
    }
  }

  const handleUpload = async () => {
    if (!uploadForm.file || !uploadForm.title.trim()) {
      alert('Please select a file and enter a title.')
      return
    }

    try {
      setUploadProgress({
        isUploading: true,
        progress: 0,
        status: 'Preparing upload...'
      })

      const formData = new FormData()
      formData.append('video', uploadForm.file)
      formData.append('title', uploadForm.title.trim())
      if (uploadForm.description.trim()) {
        formData.append('description', uploadForm.description.trim())
      }

      setUploadProgress(prev => ({
        ...prev,
        progress: 50,
        status: 'Uploading video...'
      }))

      const response = await fetch('/api/admin/videos', {
        method: 'POST',
        credentials: 'include',
        body: formData
      })

      setUploadProgress(prev => ({
        ...prev,
        progress: 90,
        status: 'Processing...'
      }))

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Upload failed')
      }

      setUploadProgress({
        isUploading: false,
        progress: 100,
        status: 'Upload complete!'
      })

      // Reset form and close dialog
      setUploadForm({ title: '', description: '', file: null })
      setUploadDialogOpen(false)

      // Refresh videos list
      await fetchVideos()

    } catch (err) {
      console.error('Upload error:', err)
      setUploadProgress({
        isUploading: false,
        progress: 0,
        status: ''
      })
      alert(err instanceof Error ? err.message : 'Upload failed')
    }
  }

  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm('Are you sure you want to delete this video? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/videos?id=${videoId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Delete failed')
      }

      // Refresh videos list
      await fetchVideos()
    } catch (err) {
      console.error('Delete error:', err)
      alert(err instanceof Error ? err.message : 'Failed to delete video')
    }
  }

  const formatFileSize = (bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB']
    let size = bytes
    let unitIndex = 0

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`
  }

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return 'Unknown'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="content-wrapper section-spacing">
          <div className="flex items-center justify-center h-64">
            <div className="loading-spinner"></div>
            <span className="ml-3 text-muted-foreground">Loading videos...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="content-wrapper section-spacing">
          <div className="error-card">
            <AlertCircle className="error-icon" />
            <h2 className="text-xl font-semibold mb-2 text-foreground">Error Loading Videos</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchVideos} className="btn-primary">Try Again</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <SiteHeader 
        searchPlaceholder="Search admin tools..."
        currentPage="Admin Panel"
        pageSubtitle="Video management system"
      />
      
      <div className="content-wrapper">
      {/* Modern Header Section */}
      <section className="section-spacing">
        <div className="text-center mb-12">
          <div className="icon-premium mb-4 mx-auto">
            <Video className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">
            <span className="text-gradient-primary">Demo Videos</span>
            <br />
            <span className="text-foreground">Management</span>
          </h1>
          <div className="w-32 h-1 gradient-primary mx-auto mb-4 rounded-full"></div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Manage PayVAT demo videos and analytics with professional tools
          </p>
        </div>
        
        <div className="flex justify-center mb-8">
          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-primary px-8 py-4 text-lg font-semibold hover-lift">
                <Plus className="h-5 w-5 mr-2" />
                Upload Video
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Upload Demo Video</DialogTitle>
              <DialogDescription>
                Upload a new demo video for the PayVAT homepage. Supported formats: MP4, MOV, AVI. Max size: 500MB.
              </DialogDescription>
            </DialogHeader>

            {uploadProgress.isUploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>{uploadProgress.status}</span>
                  <span>{uploadProgress.progress}%</span>
                </div>
                <Progress value={uploadProgress.progress} className="w-full" />
              </div>
            )}

            {!uploadProgress.isUploading && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Video Title *</Label>
                  <Input
                    id="title"
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter video title"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter video description (optional)"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="video-file">Video File *</Label>
                  <Input
                    id="video-file"
                    type="file"
                    accept="video/mp4,video/mov,video/avi,video/quicktime"
                    onChange={handleFileSelect}
                  />
                  {uploadForm.file && (
                    <p className="text-sm text-gray-600 mt-1">
                      Selected: {uploadForm.file.name} ({formatFileSize(uploadForm.file.size)})
                    </p>
                  )}
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setUploadDialogOpen(false)}
                disabled={uploadProgress.isUploading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={uploadProgress.isUploading || !uploadForm.file || !uploadForm.title.trim()}
              >
                {uploadProgress.isUploading ? 'Uploading...' : 'Upload Video'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
      </section>

      {/* Videos Grid */}
      <section className="section-spacing-sm">
      {videos.length === 0 ? (
        <div className="card-premium p-12 text-center">
          <div className="icon-premium mb-6 mx-auto opacity-50">
            <Video className="h-12 w-12 text-white" />
          </div>
          <h3 className="text-2xl font-semibold text-foreground mb-3">No Videos Yet</h3>
          <p className="text-muted-foreground text-center mb-6 max-w-md mx-auto leading-relaxed">
            Upload your first demo video to get started. This video will be displayed on the PayVAT homepage.
          </p>
          <Button onClick={() => setUploadDialogOpen(true)} className="btn-primary hover-lift">
            <Upload className="h-5 w-5 mr-2" />
            Upload First Video
          </Button>
        </div>
      ) : (
        <div className="grid gap-8">
          {videos.map((video) => (
            <div key={video.id} className="card-premium p-8 hover-lift transition-all duration-300">
                <div className="flex items-start space-x-4">
                  {/* Video Thumbnail/Preview */}
                  <div className="flex-shrink-0">
                    <div className="relative w-40 h-24 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                      {video.thumbnailUrl ? (
                        <Image
                          src={video.thumbnailUrl}
                          alt={video.title}
                          fill
                          className="object-cover rounded-lg"
                        />
                      ) : (
                        <Video className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Video Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {video.title}
                        </h3>
                        {video.description && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {video.description}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <div className={video.isActive ? 'status-success' : 'status-warning'}>
                          {video.isActive ? 'Active' : 'Inactive'}
                        </div>
                        <div className={video.status === 'READY' ? 'status-success' : 'status-info'}>
                          {video.status}
                        </div>
                      </div>
                    </div>

                    {/* Video Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Eye className="h-4 w-4 mr-1" />
                        <span>{video.stats.totalViews} views</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="h-4 w-4 mr-1" />
                        <span>{video.stats.uniqueViewers} viewers</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{formatDuration(video.duration)}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        <span>{video.stats.avgCompletionRate.toFixed(1)}% completion</span>
                      </div>
                    </div>

                    {/* Video Metadata */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center text-xs text-gray-500 space-x-4">
                        <span>Uploaded {new Date(video.uploadedAt).toLocaleDateString()}</span>
                        <span>{formatFileSize(video.fileSize)}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(video.videoUrl, '_blank')}
                          className="hover-scale"
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Preview
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedVideoForAnalytics(video.id)}
                          className="hover-scale"
                        >
                          <BarChart3 className="h-4 w-4 mr-1" />
                          Analytics
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {/* TODO: Implement edit functionality */}}
                          className="hover-scale"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteVideo(video.id)}
                          className="text-red-600 hover:text-red-700 hover-scale"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
            </div>
          ))}
        </div>
      )}
      </section>

      {/* Analytics Modal */}
      {selectedVideoForAnalytics && (
        <Dialog open={true} onOpenChange={() => setSelectedVideoForAnalytics(null)}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Video Analytics</DialogTitle>
              <DialogDescription>
                Detailed analytics for video: {videos.find(v => v.id === selectedVideoForAnalytics)?.title}
              </DialogDescription>
            </DialogHeader>
            
            <div className="mt-4">
              <VideoAnalytics videoId={selectedVideoForAnalytics} />
            </div>
            
            <DialogFooter>
              <Button onClick={() => setSelectedVideoForAnalytics(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
    
    <Footer />
    </div>
  )
}