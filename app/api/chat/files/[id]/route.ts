import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import path from 'path'
import { calculateFileHash } from '@/lib/chat-file-security'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const { id } = params
    const { searchParams } = new URL(request.url)
    const isPreview = searchParams.get('preview') === 'true'
    const download = searchParams.get('download') === 'true'

    // Get user for authentication
    const user = await getUserFromRequest(request)

    // Find the chat message with file
    const chatMessage = await prisma.chatMessage.findUnique({
      where: { 
        id,
        messageType: 'file',
        isActive: true
      },
      include: {
        session: true
      }
    })

    if (!chatMessage) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      )
    }

    // Check if file has expired
    if (chatMessage.expiresAt && chatMessage.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'File has expired' },
        { status: 410 }
      )
    }

    // Verify user access to the file
    const session = chatMessage.session
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    // Check user authorization
    const isAuthorized = (
      // User owns the session
      (user && session.userId === user.id) ||
      // Anonymous user matches session (basic check)
      (!user && !session.userId) ||
      // Admin access (if user has admin role)
      (user?.role === 'ADMIN')
    )

    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Unauthorized access to file' },
        { status: 403 }
      )
    }

    // Check if file was flagged by security scan
    if (chatMessage.scanResult === 'INFECTED' || chatMessage.scanResult === 'SUSPICIOUS') {
      // Only allow admins to access flagged files
      if (user?.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'File access restricted due to security concerns' },
          { status: 403 }
        )
      }
    }

    // Get the file path
    let filePath = chatMessage.fileUrl
    if (isPreview && chatMessage.filePreviewUrl) {
      filePath = chatMessage.filePreviewUrl
    }

    if (!filePath) {
      return NextResponse.json(
        { error: 'File path not found' },
        { status: 404 }
      )
    }

    // Read the file
    let fileBuffer: Buffer
    try {
      fileBuffer = await readFile(filePath)
    } catch (error) {
      console.error('File read error:', error)
      return NextResponse.json(
        { error: 'File not accessible' },
        { status: 404 }
      )
    }

    // Verify file integrity if hash exists
    if (chatMessage.fileHash && !isPreview) {
      try {
        const currentHash = await calculateFileHash(filePath)
        if (currentHash !== chatMessage.fileHash) {
          console.error('File integrity check failed for file:', id)
          return NextResponse.json(
            { error: 'File integrity check failed' },
            { status: 409 }
          )
        }
      } catch (error) {
        console.error('Hash verification error:', error)
      }
    }

    // Increment download count (but not for previews)
    if (!isPreview) {
      await prisma.chatMessage.update({
        where: { id },
        data: {
          downloadCount: {
            increment: 1
          }
        }
      })
    }

    // Determine content type
    let contentType = chatMessage.mimeType || 'application/octet-stream'
    let fileName = chatMessage.originalName || chatMessage.fileName || 'file'

    // For previews of images, use image content type
    if (isPreview && chatMessage.mimeType?.startsWith('image/')) {
      contentType = chatMessage.mimeType
    }

    // Set headers for file response
    const headers: Record<string, string> = {
      'Content-Type': contentType,
      'Content-Length': fileBuffer.length.toString(),
      'X-File-ID': id,
      'X-Scan-Result': chatMessage.scanResult || 'UNKNOWN',
    }

    // Set download headers if requested
    if (download) {
      headers['Content-Disposition'] = `attachment; filename="${fileName}"`
    } else {
      // For inline viewing
      headers['Content-Disposition'] = `inline; filename="${fileName}"`
    }

    // Add security headers
    headers['X-Content-Type-Options'] = 'nosniff'
    headers['X-Frame-Options'] = 'DENY'
    
    // For non-image files, prevent execution
    if (!contentType.startsWith('image/')) {
      headers['Content-Security-Policy'] = "default-src 'none'"
    }

    return new NextResponse(fileBuffer as unknown as BodyInit, {
      status: 200,
      headers
    })

  } catch (error) {
    console.error('File download error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve file' },
      { status: 500 }
    )
  }
}

// DELETE endpoint to remove files (admin only)
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const { id } = params
    const user = await getUserFromRequest(request)

    // Only admins can delete files
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Find the chat message
    const chatMessage = await prisma.chatMessage.findUnique({
      where: { 
        id,
        messageType: 'file'
      }
    })

    if (!chatMessage) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      )
    }

    // Mark file as inactive instead of deleting
    await prisma.chatMessage.update({
      where: { id },
      data: {
        isActive: false,
        message: '[File removed by administrator]'
      }
    })

    // TODO: Optionally delete the physical file
    // await require('fs').promises.unlink(chatMessage.fileUrl)

    return NextResponse.json({
      success: true,
      message: 'File marked as removed'
    })

  } catch (error) {
    console.error('File deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    )
  }
}

// HEAD endpoint for checking file availability
export async function HEAD(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const { id } = params
    const user = await getUserFromRequest(request)

    const chatMessage = await prisma.chatMessage.findUnique({
      where: { 
        id,
        messageType: 'file',
        isActive: true
      },
      include: {
        session: true
      }
    })

    if (!chatMessage) {
      return new NextResponse(null, { status: 404 })
    }

    // Check authorization (same logic as GET)
    const session = chatMessage.session
    const isAuthorized = (
      (user && session.userId === user.id) ||
      (!user && !session.userId) ||
      (user?.role === 'ADMIN')
    )

    if (!isAuthorized) {
      return new NextResponse(null, { status: 403 })
    }

    // Check expiration
    if (chatMessage.expiresAt && chatMessage.expiresAt < new Date()) {
      return new NextResponse(null, { status: 410 })
    }

    return new NextResponse(null, {
      status: 200,
      headers: {
        'Content-Type': chatMessage.mimeType || 'application/octet-stream',
        'Content-Length': chatMessage.fileSize?.toString() || '0',
        'X-File-Available': 'true',
        'X-Scan-Result': chatMessage.scanResult || 'UNKNOWN'
      }
    })

  } catch (error) {
    return new NextResponse(null, { status: 500 })
  }
}