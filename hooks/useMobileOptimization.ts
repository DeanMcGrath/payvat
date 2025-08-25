"use client"

import { useState, useEffect, useCallback } from 'react'

interface MobileOptimizationState {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  orientation: 'portrait' | 'landscape'
  screenHeight: number
  screenWidth: number
  hasTouch: boolean
  isIOS: boolean
  isAndroid: boolean
  keyboardOpen: boolean
  hasCamera: boolean
  connectionType: 'slow' | 'fast' | 'offline'
}

interface UseMobileOptimizationReturn extends MobileOptimizationState {
  optimizeForMobile: (element: HTMLElement) => void
  scrollToTop: () => void
  preventZoom: () => void
  enableSmoothScroll: () => void
  vibrate: (pattern?: number | number[]) => boolean
  shareContent: (data: ShareData) => Promise<boolean>
  fullscreen: {
    enter: () => Promise<boolean>
    exit: () => Promise<boolean>
    isSupported: boolean
  }
}

export function useMobileOptimization(): UseMobileOptimizationReturn {
  const [state, setState] = useState<MobileOptimizationState>({
    isMobile: false,
    isTablet: false, 
    isDesktop: true,
    orientation: 'landscape',
    screenHeight: 0,
    screenWidth: 0,
    hasTouch: false,
    isIOS: false,
    isAndroid: false,
    keyboardOpen: false,
    hasCamera: false,
    connectionType: 'fast'
  })

  // Detect device capabilities and characteristics
  useEffect(() => {
    if (typeof window === 'undefined') return

    const updateState = () => {
      const userAgent = navigator.userAgent.toLowerCase()
      const screenWidth = window.screen.width
      const screenHeight = window.screen.height
      
      setState({
        isMobile: screenWidth <= 768 || /android|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent),
        isTablet: screenWidth > 768 && screenWidth <= 1024,
        isDesktop: screenWidth > 1024,
        orientation: window.innerHeight > window.innerWidth ? 'portrait' : 'landscape',
        screenHeight: window.innerHeight,
        screenWidth: window.innerWidth,
        hasTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
        isIOS: /iphone|ipad|ipod/i.test(userAgent),
        isAndroid: /android/i.test(userAgent),
        keyboardOpen: false,
        hasCamera: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
        connectionType: getConnectionType()
      })
    }

    // Initial state
    updateState()

    // Listen for orientation changes
    const handleResize = () => {
      // Detect virtual keyboard on mobile
      const heightDifference = window.screen.height - window.innerHeight
      const keyboardOpen = heightDifference > 150 && screenWidth <= 768

      setState(prev => ({
        ...prev,
        orientation: window.innerHeight > window.innerWidth ? 'portrait' : 'landscape',
        screenHeight: window.innerHeight,
        screenWidth: window.innerWidth,
        keyboardOpen
      }))
    }

    // Listen for connection changes
    const handleConnectionChange = () => {
      setState(prev => ({
        ...prev,
        connectionType: getConnectionType()
      }))
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', updateState)
    
    // Modern connection API
    if ('connection' in navigator) {
      (navigator as any).connection.addEventListener('change', handleConnectionChange)
    }

    // Legacy event listeners
    window.addEventListener('online', handleConnectionChange)
    window.addEventListener('offline', handleConnectionChange)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', updateState)
      window.removeEventListener('online', handleConnectionChange)
      window.removeEventListener('offline', handleConnectionChange)
      
      if ('connection' in navigator) {
        (navigator as any).connection.removeEventListener('change', handleConnectionChange)
      }
    }
  }, [])

  // Get connection type
  const getConnectionType = (): 'slow' | 'fast' | 'offline' => {
    if (!navigator.onLine) return 'offline'
    
    if ('connection' in navigator) {
      const conn = (navigator as any).connection
      const slowConnections = ['slow-2g', '2g', '3g']
      
      if (conn.effectiveType && slowConnections.includes(conn.effectiveType)) {
        return 'slow'
      }
      
      if (conn.downlink && conn.downlink < 1.5) {
        return 'slow'
      }
    }
    
    return 'fast'
  }

  // Optimize element for mobile interaction
  const optimizeForMobile = useCallback((element: HTMLElement) => {
    if (!state.isMobile) return

    // Add touch-friendly styles
    element.style.minHeight = '44px' // Apple's recommended minimum
    element.style.minWidth = '44px'
    element.style.touchAction = 'manipulation' // Prevent zoom on double tap
    
    // Improve tap responsiveness
    element.style.cursor = 'pointer'
    element.setAttribute('role', 'button')
    
    // Add active state for better feedback
    const addActiveState = () => {
      element.style.transform = 'scale(0.95)'
      element.style.opacity = '0.8'
    }
    
    const removeActiveState = () => {
      element.style.transform = 'scale(1)'
      element.style.opacity = '1'
    }
    
    element.addEventListener('touchstart', addActiveState, { passive: true })
    element.addEventListener('touchend', removeActiveState, { passive: true })
    element.addEventListener('touchcancel', removeActiveState, { passive: true })
  }, [state.isMobile])

  // Smooth scroll to top
  const scrollToTop = useCallback(() => {
    if ('scrollBehavior' in document.documentElement.style) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      // Fallback for browsers without smooth scroll
      let scrollStep = -window.scrollY / 15
      const scrollInterval = setInterval(() => {
        if (window.scrollY !== 0) {
          window.scrollBy(0, scrollStep)
        } else {
          clearInterval(scrollInterval)
        }
      }, 15)
    }
  }, [])

  // Prevent zoom on form inputs (iOS)
  const preventZoom = useCallback(() => {
    if (!state.isIOS) return

    const viewport = document.querySelector('meta[name=viewport]') as HTMLMetaElement
    if (viewport) {
      viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
    }
  }, [state.isIOS])

  // Enable smooth scroll for the page
  const enableSmoothScroll = useCallback(() => {
    document.documentElement.style.scrollBehavior = 'smooth'
  }, [])

  // Vibration API
  const vibrate = useCallback((pattern: number | number[] = 200): boolean => {
    if ('vibrate' in navigator && state.isMobile) {
      return navigator.vibrate(pattern)
    }
    return false
  }, [state.isMobile])

  // Web Share API
  const shareContent = useCallback(async (data: ShareData): Promise<boolean> => {
    if ('share' in navigator && state.isMobile) {
      try {
        await navigator.share(data)
        return true
      } catch (error) {
        console.log('Error sharing:', error)
        return false
      }
    }
    return false
  }, [state.isMobile])

  // Fullscreen API
  const enterFullscreen = useCallback(async (): Promise<boolean> => {
    if ('requestFullscreen' in document.documentElement) {
      try {
        await document.documentElement.requestFullscreen()
        return true
      } catch (error) {
        console.log('Error entering fullscreen:', error)
        return false
      }
    }
    return false
  }, [])

  const exitFullscreen = useCallback(async (): Promise<boolean> => {
    if ('exitFullscreen' in document) {
      try {
        await document.exitFullscreen()
        return true
      } catch (error) {
        console.log('Error exiting fullscreen:', error)
        return false
      }
    }
    return false
  }, [])

  return {
    ...state,
    optimizeForMobile,
    scrollToTop,
    preventZoom,
    enableSmoothScroll,
    vibrate,
    shareContent,
    fullscreen: {
      enter: enterFullscreen,
      exit: exitFullscreen,
      isSupported: 'requestFullscreen' in document.documentElement
    }
  }
}

// Helper hook for mobile-specific form optimization
export function useMobileFormOptimization() {
  const mobile = useMobileOptimization()
  
  // Auto-focus management for mobile
  const optimizeFocusForMobile = useCallback((inputElement: HTMLInputElement | HTMLTextAreaElement) => {
    if (!mobile.isMobile) return
    
    // Delay focus to prevent zoom on iOS
    if (mobile.isIOS) {
      setTimeout(() => {
        inputElement.focus()
      }, 300)
    } else {
      inputElement.focus()
    }
  }, [mobile.isMobile, mobile.isIOS])

  // Number input optimization
  const optimizeNumberInput = useCallback((inputElement: HTMLInputElement) => {
    if (!mobile.isMobile) return
    
    inputElement.inputMode = 'numeric'
    inputElement.pattern = '[0-9]*'
  }, [mobile.isMobile])

  // Email input optimization
  const optimizeEmailInput = useCallback((inputElement: HTMLInputElement) => {
    if (!mobile.isMobile) return
    
    inputElement.inputMode = 'email'
    inputElement.autoCapitalize = 'none'
    inputElement.autoCorrect = 'off'
  }, [mobile.isMobile])

  return {
    ...mobile,
    optimizeFocusForMobile,
    optimizeNumberInput,
    optimizeEmailInput
  }
}