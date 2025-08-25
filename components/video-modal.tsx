'use client'

import { useEffect, useState, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { VideoPlayer } from './video-player'
import { X, ExternalLink, Share2 } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'

interface DemoVideo {
  id: string
  title: string
  description?: string
  videoUrl: string
  thumbnailUrl?: string
  duration?: number
  aspectRatio?: string
}

interface VideoModalProps {
  isOpen: boolean
  onClose: () => void
  className?: string
}

export function VideoModal({ isOpen, onClose, className }: VideoModalProps) {
  const [video, setVideo] = useState<DemoVideo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasVideo, setHasVideo] = useState(false)
  const sessionIdRef = useRef<string>(uuidv4())

  // Fetch demo video when modal opens
  useEffect(() => {
    if (isOpen && !video) {
      fetchDemoVideo()
    }
  }, [isOpen, video])

  const fetchDemoVideo = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/videos/demo', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `Server error: ${response.status}`)
      }

      if (data.hasVideo && data.video) {
        setVideo(data.video)
        setHasVideo(true)
      } else {
        setHasVideo(false)
        setError('No demo video is currently available')
      }
    } catch (err) {
      console.error('Error fetching demo video:', err)
      setError(err instanceof Error ? err.message : 'Failed to load demo video')
      setHasVideo(false)
    } finally {
      setLoading(false)
    }
  }

  const handleShare = async () => {
    if (!video) return

    if (navigator.share) {
      try {
        await navigator.share({
          title: `PayVAT Demo - ${video.title}`,
          text: video.description || 'Check out this PayVAT demo video',
          url: window.location.origin
        })
      } catch (err) {
        console.log('Share cancelled or failed:', err)
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.origin)
        // Could show a toast notification here
        alert('Link copied to clipboard!')
      } catch (err) {
        console.error('Failed to copy link:', err)
      }
    }
  }

  const handleVideoPlay = () => {
    // Track that video started playing
    console.log('Demo video started playing')
  }

  const handleVideoEnded = () => {
    // Could trigger some action when video ends
    console.log('Demo video finished playing')
  }

  const handleVideoError = (errorMessage: string) => {
    setError(errorMessage)
  }

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      // Don't reset video data immediately to avoid re-fetching
      setError(null)
    }
  }, [isOpen])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full p-0 bg-black border-gray-800" showCloseButton={false}>
        <DialogHeader className="sr-only">
          <DialogTitle>
            {video?.title || 'Demo Video'}
          </DialogTitle>
          <DialogDescription>
            {video?.description || 'PayVAT demo video showing how to streamline your VAT process'}
          </DialogDescription>
        </DialogHeader>
        
        {/* Custom Header with Close Button */}
        <div className="absolute top-4 right-4 z-[1002]">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-2"
            aria-label="Close video modal"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center h-96 text-white">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
              <p>Loading demo video...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="flex items-center justify-center h-96 text-white">
            <div className="text-center max-w-md mx-auto p-6">
              <div className="text-red-400 mb-4">
                <ExternalLink className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-normal mb-2">Demo Video Unavailable</h3>
              <p className="text-gray-300 mb-4">{error}</p>
              <div className="flex gap-3 justify-center">
                <Button onClick={fetchDemoVideo} variant="outline">
                  Try Again
                </Button>
                <Button onClick={onClose} variant="ghost">
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Video Content */}
        {video && !loading && !error && (
          <>
            {/* Video Player */}
            <div className="relative">
              <VideoPlayer
                src={video.videoUrl}
                poster={video.thumbnailUrl}
                title={video.title}
                autoplay={true}
                muted={true}
                className="w-full aspect-video"
                onPlay={handleVideoPlay}
                onEnded={handleVideoEnded}
                onError={handleVideoError}
                enableAnalytics={true}
                videoId={video.id}
                sessionId={sessionIdRef.current}
              />
            </div>

            {/* Video Info */}
            <div className="p-6 bg-gradient-to-b from-gray-900 to-black text-white">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-xl font-normal mb-2">{video.title}</h2>
                  {video.description && (
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {video.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShare}
                    className="text-white border-gray-600 hover:bg-white/10"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>

              {/* Call to Action */}
              <div className="mt-6 pt-4 border-t border-gray-700">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-gray-300">
                      Ready to streamline your VAT process?
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => {
                        onClose()
                        window.location.href = '/vat-guide'
                      }}
                      className="bg-petrol-base hover:bg-petrol-dark text-white"
                    >
                      Get Started
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        onClose()
                        window.location.href = '/pricing'
                      }}
                      className="text-white border-gray-600 hover:bg-white/10"
                    >
                      View Pricing
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* No Video Available */}
        {!hasVideo && !loading && !error && (
          <div className="flex items-center justify-center h-96 text-white">
            <div className="text-center max-w-md mx-auto p-6">
              <div className="text-gray-400 mb-4">
                <ExternalLink className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-normal mb-2">Demo Coming Soon</h3>
              <p className="text-gray-300 mb-4">
                We're preparing a comprehensive demo video to show you how PayVAT works. 
                Check back soon!
              </p>
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={() => {
                    onClose()
                    window.location.href = '/vat-guide'
                  }}
                  className="bg-petrol-base hover:bg-petrol-dark"
                >
                  Learn More
                </Button>
                <Button onClick={onClose} variant="outline">
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}