"use client"

import { useEffect } from 'react'

export default function JsonLdSchema() {
  useEffect(() => {
    // Load schema.json and inject it into the page
    fetch('/schema.json')
      .then(response => response.json())
      .then(schemaData => {
        const script = document.createElement('script')
        script.type = 'application/ld+json'
        script.textContent = JSON.stringify(schemaData)
        document.head.appendChild(script)
      })
      .catch(error => {
        console.warn('Failed to load JSON-LD schema:', error)
      })
  }, [])

  return null
}