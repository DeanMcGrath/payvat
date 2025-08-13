/**
 * Video Thumbnail Generation Utility
 * Generates thumbnails for uploaded videos using ffmpeg
 */

import ffmpeg from 'fluent-ffmpeg'
import { promises as fs } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'
import { put } from '@vercel/blob'

export interface ThumbnailOptions {
  timestamp?: string // Time position to capture (e.g., '00:00:10')
  width?: number // Thumbnail width
  height?: number // Thumbnail height
  quality?: number // JPEG quality (1-100)
}

/**
 * Generate thumbnail from video file
 */
export async function generateVideoThumbnail(
  videoPath: string,
  options: ThumbnailOptions = {}
): Promise<string | null> {
  const {
    timestamp = '00:00:05', // Default to 5 seconds
    width = 320,
    height = 180,
    quality = 80
  } = options

  const tempDir = tmpdir()
  const thumbnailPath = join(tempDir, `thumbnail-${Date.now()}.jpg`)

  try {
    console.log('🖼️ Generating video thumbnail...')
    
    // Check if ffmpeg is available
    if (!process.env.FFMPEG_PATH && process.env.NODE_ENV === 'production') {
      console.warn('⚠️ FFMPEG_PATH not set in production - thumbnail generation may fail')
      return null
    }

    await new Promise<void>((resolve, reject) => {
      let command = ffmpeg(videoPath)
      
      // Set ffmpeg path if specified
      if (process.env.FFMPEG_PATH) {
        command = command.setFfmpegPath(process.env.FFMPEG_PATH)
      }

      command
        .seekInput(timestamp)
        .outputOptions([
          '-vframes 1', // Extract only one frame
          '-f image2',  // Output format
          `-q:v ${Math.round((100 - quality) / 10)}` // Quality (lower number = higher quality)
        ])
        .size(`${width}x${height}`)
        .output(thumbnailPath)
        .on('end', () => {
          console.log('✅ Thumbnail generated successfully')
          resolve()
        })
        .on('error', (error) => {
          console.error('❌ Thumbnail generation failed:', error)
          reject(error)
        })
        .run()
    })

    // Check if thumbnail was created
    try {
      await fs.access(thumbnailPath)
    } catch {
      console.warn('⚠️ Thumbnail file not found after generation')
      return null
    }

    // Read thumbnail file
    const thumbnailBuffer = await fs.readFile(thumbnailPath)
    
    // Upload thumbnail to blob storage
    const thumbnailFilename = `thumbnail-${Date.now()}.jpg`
    const thumbnailBlob = await put(thumbnailFilename, thumbnailBuffer, {
      access: 'public',
      contentType: 'image/jpeg'
    })

    // Clean up temporary file
    await fs.unlink(thumbnailPath).catch(() => {
      // Ignore cleanup errors
    })

    console.log('✅ Thumbnail uploaded to blob storage:', thumbnailBlob.url)
    return thumbnailBlob.url

  } catch (error) {
    console.error('❌ Failed to generate video thumbnail:', error)
    
    // Clean up temporary file on error
    await fs.unlink(thumbnailPath).catch(() => {
      // Ignore cleanup errors
    })
    
    return null
  }
}

/**
 * Generate thumbnail from video buffer
 */
export async function generateThumbnailFromBuffer(
  videoBuffer: Buffer,
  fileName: string,
  options: ThumbnailOptions = {}
): Promise<string | null> {
  const tempDir = tmpdir()
  const tempVideoPath = join(tempDir, `temp-video-${Date.now()}-${fileName}`)

  try {
    // Write buffer to temporary file
    await fs.writeFile(tempVideoPath, videoBuffer)
    
    // Generate thumbnail
    const thumbnailUrl = await generateVideoThumbnail(tempVideoPath, options)
    
    // Clean up temporary video file
    await fs.unlink(tempVideoPath).catch(() => {
      // Ignore cleanup errors
    })
    
    return thumbnailUrl

  } catch (error) {
    console.error('❌ Failed to generate thumbnail from buffer:', error)
    
    // Clean up temporary video file on error
    await fs.unlink(tempVideoPath).catch(() => {
      // Ignore cleanup errors
    })
    
    return null
  }
}

/**
 * Get video metadata using ffmpeg
 */
export async function getVideoMetadata(videoPath: string): Promise<{
  duration?: number
  width?: number
  height?: number
  aspectRatio?: string
  bitrate?: number
  codec?: string
} | null> {
  try {
    return new Promise((resolve, reject) => {
      let command = ffmpeg(videoPath)
      
      // Set ffmpeg path if specified
      if (process.env.FFMPEG_PATH) {
        command = command.setFfmpegPath(process.env.FFMPEG_PATH)
      }

      command
        .ffprobe((error, metadata) => {
          if (error) {
            console.error('❌ Failed to get video metadata:', error)
            reject(error)
            return
          }

          const videoStream = metadata.streams.find(stream => stream.codec_type === 'video')
          if (!videoStream) {
            resolve(null)
            return
          }

          const result = {
            duration: metadata.format.duration ? Math.round(metadata.format.duration) : undefined,
            width: videoStream.width,
            height: videoStream.height,
            aspectRatio: videoStream.display_aspect_ratio || `${videoStream.width}:${videoStream.height}`,
            bitrate: metadata.format.bit_rate ? Math.round(parseInt(metadata.format.bit_rate.toString()) / 1000) : undefined,
            codec: videoStream.codec_name
          }

          resolve(result)
        })
    })
  } catch (error) {
    console.error('❌ Failed to analyze video metadata:', error)
    return null
  }
}

/**
 * Check if ffmpeg is available
 */
export function checkFfmpegAvailability(): boolean {
  try {
    // This is a simple check - in production you might want a more thorough test
    return !!process.env.FFMPEG_PATH || process.env.NODE_ENV === 'development'
  } catch {
    return false
  }
}