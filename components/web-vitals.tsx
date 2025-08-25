"use client"

import { useEffect } from 'react'

interface WebVitalsMetric {
  id: string
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  delta: number
  entries: PerformanceEntry[]
}

declare global {
  interface Window {
    gtag?: (...args: any[]) => void
  }
}

const sendToAnalytics = (metric: WebVitalsMetric) => {
  // Send to Google Analytics if available
  if (typeof window.gtag === 'function') {
    window.gtag('event', metric.name, {
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      metric_id: metric.id,
      metric_value: metric.value,
      metric_delta: metric.delta,
      metric_rating: metric.rating,
    })
  }

  // Send to internal analytics API for monitoring
  sendToInternalAnalytics(metric)

  // Log to console in development with color coding
  if (process.env.NODE_ENV === 'development') {
    const color = metric.rating === 'good' ? 'green' : metric.rating === 'needs-improvement' ? 'orange' : 'red'
    console.log(`%c[Web Vitals] ${metric.name}: ${metric.value.toFixed(2)}ms (${metric.rating})`, 
      `color: ${color}; font-weight: bold`
    )
  }
}

const sendToInternalAnalytics = async (metric: WebVitalsMetric) => {
  try {
    await fetch('/api/analytics/web-vitals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        metric: metric.name,
        value: metric.value,
        rating: metric.rating,
        id: metric.id,
        delta: metric.delta,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
      }),
    })
  } catch (error) {
    // Silently fail - don't impact user experience
    console.debug('Analytics tracking failed:', error)
  }
}

export function WebVitals() {
  useEffect(() => {
    let observerSupported = false
    
    // Check if the browser supports the APIs we need
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      observerSupported = true
    }

    if (!observerSupported) return

    const reportWebVitals = async () => {
      try {
        const { onCLS, onINP, onFCP, onLCP, onTTFB } = await import('web-vitals')
        
        // Largest Contentful Paint (LCP)
        onLCP(sendToAnalytics)
        
        // Interaction to Next Paint (INP) - replaces FID
        onINP(sendToAnalytics)
        
        // Cumulative Layout Shift (CLS)
        onCLS(sendToAnalytics)
        
        // First Contentful Paint (FCP)
        onFCP(sendToAnalytics)
        
        // Time to First Byte (TTFB)
        onTTFB(sendToAnalytics)
      } catch (error) {
        console.warn('Web Vitals could not be loaded:', error)
      }
    }

    // Report web vitals on page load
    reportWebVitals()

    // Report web vitals when page visibility changes (when user leaves page)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        reportWebVitals()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  // This component doesn't render anything visible
  return null
}

// Alternative hook for tracking performance metrics
export function useWebVitals(onMetric?: (metric: WebVitalsMetric) => void) {
  useEffect(() => {
    const reportMetric = onMetric || sendToAnalytics

    const loadWebVitals = async () => {
      try {
        const { onCLS, onINP, onFCP, onLCP, onTTFB } = await import('web-vitals')
        
        onLCP(reportMetric)
        onINP(reportMetric)
        onCLS(reportMetric)
        onFCP(reportMetric)
        onTTFB(reportMetric)
      } catch (error) {
        console.warn('Web Vitals could not be loaded:', error)
      }
    }

    loadWebVitals()
  }, [onMetric])
}

export default WebVitals