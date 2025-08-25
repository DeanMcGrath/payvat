/**
 * PageLayout - Consistent layout wrapper for all pages
 * Provides standard structure with header, content area, and footer
 */

import React from 'react'
import SiteHeader from '@/components/site-header'
import Footer from '@/components/footer'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface PageLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  breadcrumbs?: Array<{
    label: string
    href?: string
  }>
  showHeader?: boolean
  showFooter?: boolean
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '7xl' | 'full'
  className?: string
  headerProps?: any
  showBackButton?: boolean
  backButtonLabel?: string
  actions?: React.ReactNode
}

export function PageLayout({
  children,
  title,
  subtitle,
  breadcrumbs,
  showHeader = true,
  showFooter = true,
  maxWidth = '7xl',
  className = '',
  headerProps = {},
  showBackButton = false,
  backButtonLabel = 'Back',
  actions,
}: PageLayoutProps) {
  const router = useRouter()

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full',
  }

  return (
    <div className={`min-h-screen bg-neutral-50 ${className}`}>
      {/* Skip to content link for accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-petrol-base focus:text-white focus:rounded-md focus:shadow-lg"
      >
        Skip to main content
      </a>

      {/* Site Header */}
      {showHeader && <SiteHeader {...headerProps} />}
      
      {/* Main Content Area */}
      <main 
        id="main-content"
        className={`${showHeader ? 'section-after-header' : 'py-8'} flex-1 relative z-10`}
        role="main"
      >
        <div className={`${maxWidthClasses[maxWidth]} mx-auto px-6 lg:px-8`}>
          {/* Breadcrumbs */}
          {breadcrumbs && breadcrumbs.length > 0 && (
            <div className="mb-6">
              <Breadcrumb>
                <BreadcrumbList>
                  {breadcrumbs.map((crumb, index) => (
                    <React.Fragment key={index}>
                      <BreadcrumbItem>
                        {crumb.href ? (
                          <BreadcrumbLink href={crumb.href} className="text-neutral-600 hover:text-neutral-900">
                            {crumb.label}
                          </BreadcrumbLink>
                        ) : (
                          <span className="text-neutral-900 font-normal">{crumb.label}</span>
                        )}
                      </BreadcrumbItem>
                      {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                    </React.Fragment>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          )}

          {/* Page Header */}
          {(title || subtitle || showBackButton || actions) && (
            <div className="mb-8">
              {/* Back Button */}
              {showBackButton && (
                <div className="mb-4">
                  <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="text-neutral-600 hover:text-neutral-900 p-0 h-auto font-normal"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {backButtonLabel}
                  </Button>
                </div>
              )}

              {/* Title and Actions */}
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  {title && (
                    <h1 className="h1 text-neutral-900 text-balance">
                      {title}
                    </h1>
                  )}
                  {subtitle && (
                    <p className="text-lead text-neutral-600 mt-2 text-balance">
                      {subtitle}
                    </p>
                  )}
                </div>
                
                {actions && (
                  <div className="flex items-center space-x-3 ml-6">
                    {actions}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Page Content */}
          <div className="space-y-6">
            {children}
          </div>
        </div>
      </main>
      
      {/* Footer */}
      {showFooter && <Footer />}
    </div>
  )
}

/**
 * Dashboard-specific layout with sidebar support
 */
interface DashboardLayoutProps extends Omit<PageLayoutProps, 'showHeader' | 'showFooter'> {
  sidebar?: React.ReactNode
  sidebarWidth?: 'sm' | 'md' | 'lg'
}

export function DashboardLayout({
  children,
  sidebar,
  sidebarWidth = 'md',
  ...props
}: DashboardLayoutProps) {
  const sidebarWidths = {
    sm: 'w-64',
    md: 'w-80',
    lg: 'w-96',
  }

  if (!sidebar) {
    return (
      <PageLayout showHeader={false} showFooter={false} {...props}>
        {children}
      </PageLayout>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* Sidebar */}
      <aside className={`${sidebarWidths[sidebarWidth]} bg-white border-r border-neutral-200 flex-shrink-0`}>
        {sidebar}
      </aside>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <PageLayout showHeader={false} showFooter={false} {...props}>
          {children}
        </PageLayout>
      </div>
    </div>
  )
}

/**
 * Centered layout for auth pages, forms, etc.
 */
interface CenteredLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  maxWidth?: 'sm' | 'md' | 'lg'
  showLogo?: boolean
  className?: string
}

export function CenteredLayout({
  children,
  title,
  subtitle,
  maxWidth = 'md',
  showLogo = true,
  className = '',
}: CenteredLayoutProps) {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  }

  return (
    <div className={`min-h-screen bg-neutral-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 ${className}`}>
      <div className={`${maxWidthClasses[maxWidth]} w-full space-y-8`}>
        {/* Logo */}
        {showLogo && (
          <div className="text-center">
            <h1 className="text-brand-heading text-3xl payvat-brand">
              PayVAT
            </h1>
          </div>
        )}

        {/* Header */}
        {(title || subtitle) && (
          <div className="text-center">
            {title && (
              <h2 className="h3 text-neutral-900">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="body-lg text-neutral-600 mt-2">
                {subtitle}
              </p>
            )}
          </div>
        )}

        {/* Content */}
        {children}
      </div>
    </div>
  )
}

/**
 * Error layout for error pages
 */
interface ErrorLayoutProps {
  title: string
  subtitle?: string
  children?: React.ReactNode
  showHomeButton?: boolean
}

export function ErrorLayout({
  title,
  subtitle,
  children,
  showHomeButton = true,
}: ErrorLayoutProps) {
  const router = useRouter()

  return (
    <CenteredLayout maxWidth="lg">
      <div className="text-center space-y-6">
        <div className="space-y-2">
          <h1 className="h2 text-neutral-900">
            {title}
          </h1>
          {subtitle && (
            <p className="body-lg text-neutral-600">
              {subtitle}
            </p>
          )}
        </div>

        {children}

        {showHomeButton && (
          <div className="space-y-4">
            <Button
              onClick={() => router.push('/')}
              className="bg-gradient-brand text-white"
            >
              Return Home
            </Button>
          </div>
        )}
      </div>
    </CenteredLayout>
  )
}