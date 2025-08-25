"use client"

import { useState, useEffect } from 'react'
import { X, ChevronRight, CheckCircle, Star, Upload, FileText, Send, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import confetti from 'canvas-confetti'

interface OnboardingStep {
  id: string
  title: string
  description: string
  icon: any
  action?: () => void
  completed: boolean
  points: number
}

interface ProgressiveOnboardingProps {
  userId?: string
  onStepComplete?: (stepId: string) => void
  onComplete?: () => void
}

export default function ProgressiveOnboarding({
  userId,
  onStepComplete,
  onComplete
}: ProgressiveOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [totalPoints, setTotalPoints] = useState(0)
  const [showCelebration, setShowCelebration] = useState(false)
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())

  const [steps, setSteps] = useState<OnboardingStep[]>([
    {
      id: 'upload_first_document',
      title: 'Upload Your First Document',
      description: 'Try our AI-powered document processing with a sample invoice or receipt',
      icon: Upload,
      completed: false,
      points: 25
    },
    {
      id: 'review_extraction',
      title: 'Review VAT Extraction',
      description: 'See how our AI automatically extracts VAT amounts and business details',
      icon: FileText,
      completed: false,
      points: 15
    },
    {
      id: 'categorize_document',
      title: 'Categorize Your Document',
      description: 'Learn how to organize sales and purchase documents for VAT returns',
      icon: CheckCircle,
      completed: false,
      points: 20
    },
    {
      id: 'preview_vat_return',
      title: 'Preview VAT Return',
      description: 'See how your documents automatically populate a VAT3 return form',
      icon: Send,
      completed: false,
      points: 30
    },
    {
      id: 'setup_reminders',
      title: 'Set Up VAT Reminders',
      description: 'Never miss a VAT deadline with automated email reminders',
      icon: Star,
      completed: false,
      points: 10
    }
  ])

  // Check if user has completed onboarding before
  useEffect(() => {
    if (userId) {
      const savedProgress = localStorage.getItem(`onboarding_${userId}`)
      if (savedProgress) {
        const { completed, points, currentStepIndex } = JSON.parse(savedProgress)
        setCompletedSteps(new Set(completed))
        setTotalPoints(points)
        setCurrentStep(currentStepIndex)
        
        // Update steps completed status
        setSteps(prev => prev.map(step => ({
          ...step,
          completed: completed.includes(step.id)
        })))
        
        // Show onboarding if not completed
        if (completed.length < steps.length) {
          setIsVisible(true)
        }
      } else {
        // First time user
        setIsVisible(true)
      }
    }
  }, [userId])

  // Save progress to localStorage
  const saveProgress = () => {
    if (userId) {
      const progress = {
        completed: Array.from(completedSteps),
        points: totalPoints,
        currentStepIndex: currentStep,
        lastActive: Date.now()
      }
      localStorage.setItem(`onboarding_${userId}`, JSON.stringify(progress))
    }
  }

  const completeStep = (stepId: string) => {
    const step = steps.find(s => s.id === stepId)
    if (!step || step.completed) return

    // Update step completion
    setSteps(prev => prev.map(s => 
      s.id === stepId ? { ...s, completed: true } : s
    ))
    setCompletedSteps(prev => new Set([...prev, stepId]))
    setTotalPoints(prev => prev + step.points)

    // Show celebration animation
    setShowCelebration(true)
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    })

    setTimeout(() => setShowCelebration(false), 3000)

    // Move to next step
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    }

    // Save progress
    saveProgress()

    // Notify parent
    onStepComplete?.(stepId)

    // Check if all steps completed
    if (completedSteps.size + 1 >= steps.length) {
      setTimeout(() => {
        onComplete?.()
        setIsVisible(false)
      }, 2000)
    }
  }

  const skipOnboarding = () => {
    setIsVisible(false)
    if (userId) {
      localStorage.setItem(`onboarding_${userId}`, JSON.stringify({
        skipped: true,
        timestamp: Date.now()
      }))
    }
  }

  const progressPercent = (completedSteps.size / steps.length) * 100

  if (!isVisible) return null

  const currentStepData = steps[currentStep]

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-50 animate-in fade-in duration-300" />
      
      {/* Onboarding Modal */}
      <div className="fixed inset-0 z-51 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg bg-white shadow-2xl animate-in zoom-in duration-300">
          <CardContent className="p-0">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-green-700 text-white p-6 rounded-t-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Trophy className="h-6 w-6 text-yellow-300" />
                  <h2 className="text-xl font-bold">Get Started with PayVAT</h2>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge className="bg-white/20 text-white">
                    {totalPoints} points
                  </Badge>
                  <button 
                    onClick={skipOnboarding}
                    className="text-white/80 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{completedSteps.size} of {steps.length} completed</span>
                </div>
                <Progress value={progressPercent} className="bg-green-400/30 h-2" />
              </div>
            </div>

            {/* Current Step */}
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <currentStepData.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{currentStepData.title}</h3>
                <p className="text-gray-600">{currentStepData.description}</p>
              </div>

              {/* Step indicator */}
              <div className="flex items-center justify-center space-x-2 mb-6">
                {steps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step.completed 
                        ? 'bg-green-500 text-white' 
                        : index === currentStep 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    {step.completed ? <CheckCircle className="h-4 w-4" /> : index + 1}
                  </div>
                ))}
              </div>

              {/* Action buttons */}
              <div className="space-y-3">
                <Button
                  onClick={() => completeStep(currentStepData.id)}
                  disabled={currentStepData.completed}
                  size="lg"
                  className="w-full"
                >
                  {currentStepData.completed ? (
                    <>
                      <CheckCircle className="mr-2 h-5 w-5" />
                      Completed (+{currentStepData.points} points)
                    </>
                  ) : (
                    <>
                      Complete Step
                      <ChevronRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
                
                {currentStep < steps.length - 1 && (
                  <Button
                    onClick={() => setCurrentStep(prev => Math.min(prev + 1, steps.length - 1))}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    Skip This Step
                  </Button>
                )}
              </div>

              {/* Benefits reminder */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Why complete onboarding?</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Get familiar with VAT automation features</li>
                  <li>• Learn best practices for Irish VAT compliance</li>
                  <li>• Unlock achievement badges and points</li>
                  <li>• Get personalized tips for your business</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Celebration overlay */}
      {showCelebration && (
        <div className="fixed inset-0 z-52 flex items-center justify-center pointer-events-none">
          <div className="bg-green-500 text-white px-8 py-4 rounded-lg shadow-2xl animate-in zoom-in duration-500">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-6 w-6" />
              <span className="font-bold">Step Completed! +{currentStepData.points} points</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// Hook for managing onboarding state
export function useProgressiveOnboarding(userId?: string) {
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false)
  const [currentOnboardingStep, setCurrentOnboardingStep] = useState(0)

  useEffect(() => {
    if (userId) {
      const savedProgress = localStorage.getItem(`onboarding_${userId}`)
      if (savedProgress) {
        const progress = JSON.parse(savedProgress)
        setIsOnboardingComplete(progress.completed?.length >= 5 || progress.skipped)
        setCurrentOnboardingStep(progress.currentStepIndex || 0)
      }
    }
  }, [userId])

  const markStepComplete = (stepId: string) => {
    // This would be called from the actual app when user performs actions
    console.log(`Onboarding step completed: ${stepId}`)
  }

  return {
    isOnboardingComplete,
    currentOnboardingStep,
    markStepComplete
  }
}