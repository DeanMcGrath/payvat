'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Settings,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface VideoPlayerProps {
  src: string
  poster?: string
  title?: string
  autoplay?: boolean
  muted?: boolean
  className?: string
  onPlay?: () => void
  onPause?: () => void
  onTimeUpdate?: (currentTime: number, duration: number) => void
  onEnded?: () => void
  onLoadStart?: () => void
  onLoadedData?: () => void
  onError?: (error: string) => void
  enableAnalytics?: boolean
  videoId?: string
  sessionId?: string
}

interface VideoAnalytics {
  startTime: number
  watchDuration: number
  playCount: number
  bufferEvents: number
  lastCurrentTime: number
}

export function VideoPlayer({
  src,
  poster,
  title,
  autoplay = false,
  muted = true,
  className,
  onPlay,
  onPause,
  onTimeUpdate,
  onEnded,
  onLoadStart,
  onLoadedData,
  onError,
  enableAnalytics = false,
  videoId,
  sessionId
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(muted)
  const [isLoading, setIsLoading] = useState(true)
  const [showControls, setShowControls] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Analytics tracking
  const analyticsRef = useRef<VideoAnalytics>({
    startTime: Date.now(),
    watchDuration: 0,
    playCount: 0,
    bufferEvents: 0,
    lastCurrentTime: 0
  })

  const hideControlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Send analytics data to API
  const sendAnalytics = useCallback(async (data: Partial<VideoAnalytics> & { completionRate?: number }) => {
    if (!enableAnalytics || !videoId) return

    try {
      await fetch('/api/videos/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoId,
          sessionId,
          watchDuration: Math.round(data.watchDuration || analyticsRef.current.watchDuration),
          completionRate: data.completionRate || 0,
          playCount: data.playCount || 1,
          bufferEvents: data.bufferEvents || analyticsRef.current.bufferEvents,
          loadTime: data.startTime ? Date.now() - data.startTime : undefined
        })
      })
    } catch (error) {
      console.warn('Analytics tracking failed:', error)
    }
  }, [enableAnalytics, videoId, sessionId])

  const togglePlayPause = useCallback(async () => {
    const video = videoRef.current
    if (!video) return

    try {
      if (isPlaying) {
        video.pause()
      } else {
        await video.play()
      }
    } catch (err) {
      console.error('Playback error:', err)
      setError('Failed to play video')
      onError?.('Failed to play video')
    }
  }, [isPlaying, onError])

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current
    if (!video) return

    const current = video.currentTime
    const total = video.duration

    setCurrentTime(current)
    setDuration(total)

    // Update analytics
    if (enableAnalytics) {
      const watchDuration = Math.max(0, current - analyticsRef.current.lastCurrentTime) + analyticsRef.current.watchDuration
      analyticsRef.current.watchDuration = watchDuration
      analyticsRef.current.lastCurrentTime = current
    }

    onTimeUpdate?.(current, total)
  }, [onTimeUpdate, enableAnalytics])

  const handleSeek = useCallback((value: number[]) => {
    const video = videoRef.current
    if (!video || !duration) return

    const newTime = (value[0] / 100) * duration
    video.currentTime = newTime
    setCurrentTime(newTime)
  }, [duration])

  const handleVolumeChange = useCallback((value: number[]) => {
    const video = videoRef.current
    if (!video) return

    const newVolume = value[0] / 100
    video.volume = newVolume
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }, [])

  const toggleMute = useCallback(() => {
    const video = videoRef.current
    if (!video) return

    if (isMuted) {
      video.volume = volume || 0.5
      setIsMuted(false)
    } else {
      video.volume = 0
      setIsMuted(true)
    }
  }, [isMuted, volume])

  const toggleFullscreen = useCallback(async () => {
    const container = containerRef.current
    if (!container) return

    try {
      if (!isFullscreen) {
        await container.requestFullscreen()
        setIsFullscreen(true)
      } else {
        await document.exitFullscreen()
        setIsFullscreen(false)
      }
    } catch (err) {
      console.error('Fullscreen error:', err)
    }
  }, [isFullscreen])

  const showControlsTemporarily = useCallback(() => {
    setShowControls(true)
    
    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current)
    }

    hideControlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false)
      }
    }, 3000)
  }, [isPlaying])

  const formatTime = (seconds: number) => {
    if (!seconds || !isFinite(seconds)) return '0:00'
    
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = Math.floor(seconds % 60)

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  // Event handlers
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handlePlay = () => {
      setIsPlaying(true)
      analyticsRef.current.playCount += 1
      analyticsRef.current.startTime = Date.now()
      onPlay?.()
      
      if (enableAnalytics) {
        sendAnalytics({ playCount: analyticsRef.current.playCount })
      }
    }

    const handlePause = () => {
      setIsPlaying(false)
      setShowControls(true)
      onPause?.()
    }

    const handleLoadStart = () => {
      setIsLoading(true)
      onLoadStart?.()
    }

    const handleLoadedData = () => {
      setIsLoading(false)
      setDuration(video.duration)
      onLoadedData?.()
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setShowControls(true)
      
      if (enableAnalytics) {
        const completionRate = duration > 0 ? (currentTime / duration) * 100 : 0
        sendAnalytics({ 
          completionRate,
          watchDuration: analyticsRef.current.watchDuration 
        })
      }
      
      onEnded?.()
    }

    const handleError = () => {
      setIsLoading(false)
      setError('Failed to load video')
      onError?.('Failed to load video')
    }

    const handleWaiting = () => {
      analyticsRef.current.bufferEvents += 1
    }

    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('loadstart', handleLoadStart)
    video.addEventListener('loadeddata', handleLoadedData)
    video.addEventListener('ended', handleEnded)
    video.addEventListener('error', handleError)
    video.addEventListener('waiting', handleWaiting)

    return () => {
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('loadstart', handleLoadStart)
      video.removeEventListener('loadeddata', handleLoadedData)
      video.removeEventListener('ended', handleEnded)
      video.removeEventListener('error', handleError)
      video.removeEventListener('waiting', handleWaiting)
    }
  }, [onPlay, onPause, onEnded, onLoadStart, onLoadedData, onError, handleTimeUpdate, enableAnalytics, sendAnalytics, duration, currentTime])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!containerRef.current?.contains(document.activeElement)) return

      switch (e.key) {
        case ' ':
          e.preventDefault()
          togglePlayPause()
          break
        case 'f':
          e.preventDefault()
          toggleFullscreen()
          break
        case 'm':
          e.preventDefault()
          toggleMute()
          break
        case 'ArrowLeft':
          e.preventDefault()
          handleSeek([Math.max(0, ((currentTime - 10) / duration) * 100)])
          break
        case 'ArrowRight':
          e.preventDefault()
          handleSeek([Math.min(100, ((currentTime + 10) / duration) * 100)])
          break
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [togglePlayPause, toggleFullscreen, toggleMute, handleSeek, currentTime, duration])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hideControlsTimeoutRef.current) {
        clearTimeout(hideControlsTimeoutRef.current)
      }
    }
  }, [])

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative bg-black rounded-lg overflow-hidden group',
        'focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500',
        className
      )}
      onMouseMove={showControlsTemporarily}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => {
        if (isPlaying) {
          setShowControls(false)
        }
      }}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay={autoplay}
        muted={isMuted}
        playsInline
        className="w-full h-full object-contain"
        onClick={togglePlayPause}
      />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
        </div>
      )}

      {/* Error Overlay */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/75 text-white">
          <div className="text-center">
            <p className="text-lg mb-2">Video Error</p>
            <p className="text-sm text-gray-300">{error}</p>
          </div>
        </div>
      )}

      {/* Play Button Overlay */}
      {!isPlaying && !isLoading && !error && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-black/25 cursor-pointer"
          onClick={togglePlayPause}
        >
          <div className="bg-white/90 rounded-full p-4 hover:bg-white transition-colors">
            <Play className="h-12 w-12 text-black ml-1" />
          </div>
        </div>
      )}

      {/* Controls */}
      <div className={cn(
        'absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4',
        'transition-opacity duration-300',
        showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
      )}>
        {/* Progress Bar */}
        <div className="mb-4">
          <Slider
            value={[progressPercentage]}
            onValueChange={handleSeek}
            max={100}
            step={0.1}
            className="w-full cursor-pointer"
          />
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={togglePlayPause}
              className="text-white hover:bg-white/20 p-2"
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
            </Button>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMute}
                className="text-white hover:bg-white/20 p-2"
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
              
              <div className="w-20">
                <Slider
                  value={[isMuted ? 0 : volume * 100]}
                  onValueChange={handleVolumeChange}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>

            <div className="text-white text-sm font-mono">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {title && (
              <span className="text-white text-sm font-medium hidden md:block">
                {title}
              </span>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className="text-white hover:bg-white/20 p-2"
            >
              <Maximize className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}