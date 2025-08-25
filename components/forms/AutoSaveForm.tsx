"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { Save, CheckCircle, AlertCircle, Wifi, WifiOff } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface AutoSaveState {
  status: 'idle' | 'saving' | 'saved' | 'error' | 'offline'
  lastSaved?: Date
  hasUnsavedChanges: boolean
}

interface AutoSaveFormProps {
  children: React.ReactNode
  formId: string
  onSave: (data: any) => Promise<void>
  saveInterval?: number // milliseconds
  debounceDelay?: number // milliseconds
  className?: string
}

export default function AutoSaveForm({
  children,
  formId,
  onSave,
  saveInterval = 30000, // 30 seconds
  debounceDelay = 2000,  // 2 seconds after last change
  className = ''
}: AutoSaveFormProps) {
  const [saveState, setSaveState] = useState<AutoSaveState>({
    status: 'idle',
    hasUnsavedChanges: false
  })
  
  const [isOnline, setIsOnline] = useState(true)
  const formRef = useRef<HTMLDivElement>(null)
  const saveTimeoutRef = useRef<NodeJS.Timeout>()
  const intervalRef = useRef<NodeJS.Timeout>()
  const lastSaveDataRef = useRef<string>('')

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    setIsOnline(navigator.onLine)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Extract form data
  const getFormData = useCallback(() => {
    if (!formRef.current) return {}
    
    const formData = new FormData()
    const inputs = formRef.current.querySelectorAll('input, select, textarea')
    const data: Record<string, any> = {}
    
    inputs.forEach((input) => {
      if (input instanceof HTMLInputElement) {
        if (input.type === 'checkbox') {
          data[input.name] = input.checked
        } else if (input.type === 'radio') {
          if (input.checked) {
            data[input.name] = input.value
          }
        } else if (input.type !== 'submit' && input.type !== 'button') {
          data[input.name] = input.value
        }
      } else if (input instanceof HTMLSelectElement) {
        data[input.name] = input.value
      } else if (input instanceof HTMLTextAreaElement) {
        data[input.name] = input.value
      }
    })
    
    return data
  }, [])

  // Save form data
  const saveForm = useCallback(async (force = false) => {
    if (!isOnline && !force) {
      setSaveState(prev => ({ ...prev, status: 'offline' }))
      return
    }

    const currentData = getFormData()
    const currentDataString = JSON.stringify(currentData)
    
    // Skip if no changes
    if (!force && currentDataString === lastSaveDataRef.current) {
      return
    }
    
    try {
      setSaveState(prev => ({ 
        ...prev, 
        status: 'saving',
        hasUnsavedChanges: true 
      }))
      
      // Add form metadata
      const saveData = {
        ...currentData,
        formId,
        timestamp: new Date().toISOString(),
        version: 1
      }
      
      await onSave(saveData)
      
      lastSaveDataRef.current = currentDataString
      setSaveState({
        status: 'saved',
        lastSaved: new Date(),
        hasUnsavedChanges: false
      })
      
      // Store backup in localStorage
      localStorage.setItem(`form_backup_${formId}`, JSON.stringify(saveData))
      
    } catch (error) {
      console.error('Auto-save error:', error)
      setSaveState(prev => ({ 
        ...prev, 
        status: 'error',
        hasUnsavedChanges: true
      }))
      
      // Store failed save for retry
      const failedSave = {
        ...currentData,
        formId,
        timestamp: new Date().toISOString(),
        failed: true
      }
      localStorage.setItem(`form_failed_${formId}`, JSON.stringify(failedSave))
    }
  }, [formId, onSave, getFormData, isOnline])

  // Debounced save on form changes
  const debouncedSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    
    setSaveState(prev => ({ 
      ...prev, 
      hasUnsavedChanges: true,
      status: prev.status === 'error' ? 'error' : 'idle'
    }))
    
    saveTimeoutRef.current = setTimeout(() => {
      saveForm()
    }, debounceDelay)
  }, [saveForm, debounceDelay])

  // Set up form change listeners
  useEffect(() => {
    const formElement = formRef.current
    if (!formElement) return

    const handleFormChange = (e: Event) => {
      const target = e.target as HTMLElement
      
      // Only trigger on form controls
      if (target instanceof HTMLInputElement || 
          target instanceof HTMLSelectElement || 
          target instanceof HTMLTextAreaElement) {
        debouncedSave()
      }
    }

    // Listen for various change events
    formElement.addEventListener('input', handleFormChange)
    formElement.addEventListener('change', handleFormChange)
    formElement.addEventListener('keyup', handleFormChange)
    
    return () => {
      formElement.removeEventListener('input', handleFormChange)
      formElement.removeEventListener('change', handleFormChange)  
      formElement.removeEventListener('keyup', handleFormChange)
    }
  }, [debouncedSave])

  // Periodic save interval
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      if (saveState.hasUnsavedChanges && isOnline) {
        saveForm()
      }
    }, saveInterval)
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [saveForm, saveInterval, saveState.hasUnsavedChanges, isOnline])

  // Retry failed saves when back online
  useEffect(() => {
    if (isOnline && saveState.status === 'offline') {
      // Check for failed saves to retry
      const failedSave = localStorage.getItem(`form_failed_${formId}`)
      if (failedSave) {
        try {
          const data = JSON.parse(failedSave)
          saveForm(true)
          localStorage.removeItem(`form_failed_${formId}`)
        } catch (error) {
          console.error('Error retrying failed save:', error)
        }
      } else {
        // Just retry current form
        saveForm()
      }
    }
  }, [isOnline, saveState.status, formId, saveForm])

  // Save on page unload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (saveState.hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?'
        
        // Try to save immediately
        saveForm(true)
        
        return e.returnValue
      }
    }
    
    window.addEventListener('beforeunload', handleBeforeUnload)
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [saveState.hasUnsavedChanges, saveForm])

  // Cleanup
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  // Restore from backup on component mount
  useEffect(() => {
    const backup = localStorage.getItem(`form_backup_${formId}`)
    if (backup) {
      try {
        const data = JSON.parse(backup)
        
        // Show option to restore
        toast.info(
          'Previous form data found. Would you like to restore it?',
          {
            action: {
              label: 'Restore',
              onClick: () => {
                // Populate form fields
                Object.entries(data).forEach(([key, value]) => {
                  const input = document.querySelector(`[name="${key}"]`) as HTMLInputElement
                  if (input && typeof value === 'string') {
                    input.value = value
                    input.dispatchEvent(new Event('input', { bubbles: true }))
                  }
                })
                toast.success('Form data restored')
              }
            },
            duration: 10000
          }
        )
      } catch (error) {
        console.error('Error parsing backup:', error)
      }
    }
  }, [formId])

  const getSaveStatusIcon = () => {
    switch (saveState.status) {
      case 'saving':
        return <Save className="h-3 w-3 animate-pulse" />
      case 'saved':
        return <CheckCircle className="h-3 w-3" />
      case 'error':
        return <AlertCircle className="h-3 w-3" />
      case 'offline':
        return <WifiOff className="h-3 w-3" />
      default:
        return <Save className="h-3 w-3" />
    }
  }

  const getSaveStatusColor = () => {
    switch (saveState.status) {
      case 'saving':
        return 'blue'
      case 'saved':
        return 'green'
      case 'error':
        return 'red'
      case 'offline':
        return 'orange'
      default:
        return 'gray'
    }
  }

  const getSaveStatusText = () => {
    switch (saveState.status) {
      case 'saving':
        return 'Saving...'
      case 'saved':
        return saveState.lastSaved 
          ? `Saved ${saveState.lastSaved.toLocaleTimeString()}`
          : 'Saved'
      case 'error':
        return 'Save failed'
      case 'offline':
        return 'Offline - will save when online'
      default:
        return saveState.hasUnsavedChanges ? 'Unsaved changes' : 'No changes'
    }
  }

  return (
    <div className={className}>
      {/* Save Status Indicator */}
      <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-2">
          <div className={`text-${getSaveStatusColor()}-500`}>
            {getSaveStatusIcon()}
          </div>
          <span className="text-sm text-gray-700">
            {getSaveStatusText()}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          {!isOnline && (
            <Badge variant="outline" className="text-orange-600 border-orange-200">
              <WifiOff className="h-3 w-3 mr-1" />
              Offline
            </Badge>
          )}
          
          <Badge 
            variant="outline" 
            className={`text-${getSaveStatusColor()}-600 border-${getSaveStatusColor()}-200`}
          >
            Auto-save: ON
          </Badge>
        </div>
      </div>

      {/* Form Content */}
      <div ref={formRef} className="space-y-6">
        {children}
      </div>
      
      {/* Manual Save Button for Mobile */}
      <div className="mt-6 flex justify-center md:hidden">
        <button
          onClick={() => saveForm(true)}
          disabled={saveState.status === 'saving' || !isOnline}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          <span>Save Now</span>
        </button>
      </div>
    </div>
  )
}