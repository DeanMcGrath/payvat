"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Shield, CheckCircle, Clock, Lock, Eye, Database, Mail, ArrowUp, BookOpen, Users, FileText } from 'lucide-react'
import Footer from "@/components/footer"
import SiteHeader from "@/components/site-header"

export default function PrivacyPage() {
  const [isVisible, setIsVisible] = useState(false)
  const [activeSection, setActiveSection] = useState('')

  useEffect(() => {
    // Trigger animations after component mounts
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 100)

    // Add scroll-triggered animations
    const handleScroll = () => {
      const elements = document.querySelectorAll('[data-animate]')
      elements.forEach((element) => {
        const rect = element.getBoundingClientRect()
        const isInView = rect.top < window.innerHeight && rect.bottom > 0
        
        if (isInView) {
          element.classList.add('animate-slide-up')
          element.removeAttribute('data-animate')
        }
      })
      
      // Update active section for table of contents
      const sections = document.querySelectorAll('section[id]')
      sections.forEach((section) => {
        const rect = section.getBoundingClientRect()
        if (rect.top <= 100 && rect.bottom >= 100) {
          setActiveSection(section.id)
        }
      })
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // Run once on mount

    return () => {
      clearTimeout(timer)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader 
        searchPlaceholder="Search privacy policy..."
        currentPage="Privacy Policy"
        pageSubtitle="Data protection & privacy rights"
      />

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center">
            {/* Hero Content */}
            <div className="max-w-4xl mx-auto animate-fade-in">
              <div className="mb-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-3 animate-bounce-gentle">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse-gentle"></div>
                  Your data, your rights
                </div>
                
                <div className="icon-premium mb-3 mx-auto">
                  <Shield className="h-12 w-12 text-white" />
                </div>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-2">
                  <span className="text-gradient-primary">Privacy</span>
                  <br />
                  <span className="text-foreground">Policy</span>
                </h1>
                
                <div className="w-32 h-1 gradient-primary mx-auto mb-4 rounded-full"></div>
                
                <p className="text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  How we collect, use, and protect your personal information. 
                  <span className="text-primary font-semibold">Transparent and GDPR compliant.</span>
                </p>
              </div>
              
              {/* Trust Indicators */}
              <div className="flex items-center justify-center gap-8 text-muted-foreground text-sm mb-2">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-success" />
                  <span>GDPR compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-success" />
                  <span>Secure</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span>Your rights protected</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Background Elements */}
          <div className="absolute top-20 left-10 w-16 h-16 gradient-accent rounded-full blur-xl opacity-20 animate-float"></div>
          <div className="absolute top-32 right-20 w-12 h-12 gradient-primary rounded-full blur-lg opacity-30 animate-float" style={{animationDelay: '-2s'}}></div>
          <div className="absolute bottom-20 left-20 w-20 h-20 gradient-glass rounded-full blur-2xl opacity-25 animate-float" style={{animationDelay: '-4s'}}></div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-4 gap-12">
          {/* Table of Contents - Sidebar */}
          <div className="lg:col-span-1">
            <div className="card-modern p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-primary" />
                Contents
              </h2>
              <nav className="space-y-2">
                {[
                  { id: 'information', title: '1. Information We Collect' },
                  { id: 'usage', title: '2. How We Use Your Information' },
                  { id: 'sharing', title: '3. Information Sharing' },
                  { id: 'security', title: '4. Data Security' },
                  { id: 'rights', title: '5. Your Rights' },
                  { id: 'contact', title: '6. Contact Us' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 hover:bg-primary/10 hover:text-primary ${
                      activeSection === item.id 
                        ? 'bg-primary/10 text-primary font-medium' 
                        : 'text-muted-foreground'
                    }`}
                  >
                    {item.title}
                  </button>
                ))}
              </nav>
              
              <div className="mt-8 pt-6 border-t border-border">
                <div className="text-xs text-muted-foreground mb-2">
                  <strong>Last updated:</strong><br />
                  {new Date().toLocaleDateString()}
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={scrollToTop}
                  className="w-full mt-4"
                >
                  <ArrowUp className="h-4 w-4 mr-2" />
                  Back to Top
                </Button>
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="card-premium p-12 space-y-12">
            
            <section id="information" data-animate>
              <div className="flex items-start gap-4 mb-2">
                <div className="icon-premium">
                  <Database className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-1">1. Information We Collect</h2>
                  <div className="w-16 h-1 gradient-primary rounded-full"></div>
                </div>
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed mb-2">
                When you use PayVAT, we collect information you provide directly to us, such as:
              </p>
              <div className="grid gap-4">
                <div className="card-modern p-6 hover-lift">
                  <div className="flex items-start gap-4">
                    <div className="icon-modern bg-blue-500">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Account Information</h3>
                      <p className="text-sm text-muted-foreground">Email address, business name, VAT number, and contact details</p>
                    </div>
                  </div>
                </div>
                
                <div className="card-modern p-6 hover-lift">
                  <div className="flex items-start gap-4">
                    <div className="icon-modern bg-green-500">
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Document Uploads</h3>
                      <p className="text-sm text-muted-foreground">VAT-related documents and invoices for processing</p>
                    </div>
                  </div>
                </div>
                
                <div className="card-modern p-6 hover-lift">
                  <div className="flex items-start gap-4">
                    <div className="icon-modern bg-purple-500">
                      <Lock className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Payment Information</h3>
                      <p className="text-sm text-muted-foreground">Processed securely through Stripe - we don't store card details</p>
                    </div>
                  </div>
                </div>
                
                <div className="card-modern p-6 hover-lift">
                  <div className="flex items-start gap-4">
                    <div className="icon-modern bg-orange-500">
                      <Mail className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Communication Data</h3>
                      <p className="text-sm text-muted-foreground">Support conversations and account-related communications</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section id="usage" data-animate>
              <div className="flex items-start gap-4 mb-2">
                <div className="icon-modern bg-primary">
                  <Eye className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-1">2. How We Use Your Information</h2>
                  <div className="w-16 h-1 bg-primary rounded-full"></div>
                </div>
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed mb-2">
                We use the information we collect to:
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 card-modern hover-lift">
                  <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold mt-1">1</div>
                  <span className="text-foreground">Provide and improve our VAT processing services</span>
                </div>
                <div className="flex items-start gap-3 p-4 card-modern hover-lift">
                  <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold mt-1">2</div>
                  <span className="text-foreground">Process your documents and generate VAT returns</span>
                </div>
                <div className="flex items-start gap-3 p-4 card-modern hover-lift">
                  <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold mt-1">3</div>
                  <span className="text-foreground">Handle payments and billing securely</span>
                </div>
                <div className="flex items-start gap-3 p-4 card-modern hover-lift">
                  <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold mt-1">4</div>
                  <span className="text-foreground">Communicate with you about your account and services</span>
                </div>
                <div className="flex items-start gap-3 p-4 card-modern hover-lift">
                  <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold mt-1">5</div>
                  <span className="text-foreground">Comply with legal obligations and regulatory requirements</span>
                </div>
              </div>
            </section>

            <section id="sharing" data-animate>
              <div className="flex items-start gap-4 mb-2">
                <div className="icon-modern bg-warning">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-1">3. Information Sharing</h2>
                  <div className="w-16 h-1 bg-warning rounded-full"></div>
                </div>
              </div>
              <div className="card-modern p-8 bg-warning/5 border-warning/20 mb-2">
                <div className="flex items-start gap-4">
                  <Shield className="h-6 w-6 text-warning mt-1" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">We Never Sell Your Data</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      We do not sell or rent your personal information. Your privacy is our priority.
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed mb-2">
                We may share information only in these limited circumstances:
              </p>
              <div className="grid gap-4">
                <div className="card-modern p-6 hover-lift">
                  <div className="flex items-start gap-4">
                    <div className="icon-modern bg-blue-500">
                      <CheckCircle className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Service Providers</h3>
                      <p className="text-sm text-muted-foreground">With trusted partners who help us operate our services (e.g., hosting, payment processing)</p>
                    </div>
                  </div>
                </div>
                <div className="card-modern p-6 hover-lift">
                  <div className="flex items-start gap-4">
                    <div className="icon-modern bg-red-500">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Legal Requirements</h3>
                      <p className="text-sm text-muted-foreground">When required by law or to protect our rights and users</p>
                    </div>
                  </div>
                </div>
                <div className="card-modern p-6 hover-lift">
                  <div className="flex items-start gap-4">
                    <div className="icon-modern bg-green-500">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">With Your Consent</h3>
                      <p className="text-sm text-muted-foreground">Only when you explicitly agree to share information</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section id="security" data-animate>
              <div className="flex items-start gap-4 mb-2">
                <div className="icon-premium">
                  <Lock className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-1">4. Data Security</h2>
                  <div className="w-16 h-1 gradient-primary rounded-full"></div>
                </div>
              </div>
              <div className="card-premium p-8 mb-2">
                <p className="text-lg text-muted-foreground leading-relaxed mb-2">
                  We implement appropriate security measures to protect your information against 
                  unauthorized access, alteration, disclosure, or destruction. All sensitive data 
                  is encrypted in transit and at rest.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="card-modern p-6 hover-lift">
                    <div className="flex items-center gap-3 mb-3">
                      <Lock className="h-6 w-6 text-success" />
                      <h3 className="font-semibold text-foreground">Encryption</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">AES-256 encryption for data at rest and TLS 1.3 for data in transit</p>
                  </div>
                  <div className="card-modern p-6 hover-lift">
                    <div className="flex items-center gap-3 mb-3">
                      <Shield className="h-6 w-6 text-success" />
                      <h3 className="font-semibold text-foreground">Access Control</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">Multi-factor authentication and role-based access controls</p>
                  </div>
                  <div className="card-modern p-6 hover-lift">
                    <div className="flex items-center gap-3 mb-3">
                      <Database className="h-6 w-6 text-success" />
                      <h3 className="font-semibold text-foreground">EU Data Centers</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">All data stored in GDPR-compliant EU facilities</p>
                  </div>
                  <div className="card-modern p-6 hover-lift">
                    <div className="flex items-center gap-3 mb-3">
                      <Clock className="h-6 w-6 text-success" />
                      <h3 className="font-semibold text-foreground">Regular Audits</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">Continuous security monitoring and vulnerability assessments</p>
                  </div>
                </div>
              </div>
            </section>

            <section id="rights" data-animate>
              <div className="flex items-start gap-4 mb-2">
                <div className="icon-modern bg-success">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-1">5. Your Rights</h2>
                  <div className="w-16 h-1 bg-success rounded-full"></div>
                </div>
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed mb-2">
                Under GDPR and Irish data protection law, you have the right to:
              </p>
              <div className="grid gap-6">
                <div className="card-modern p-8 hover-lift">
                  <div className="flex items-start gap-6">
                    <div className="icon-modern bg-blue-500">
                      <Eye className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground mb-1">Access Your Data</h3>
                      <p className="text-muted-foreground mb-3">Request a copy of all personal information we hold about you</p>
                      <Button size="sm" variant="outline">Request Data Export</Button>
                    </div>
                  </div>
                </div>
                
                <div className="card-modern p-8 hover-lift">
                  <div className="flex items-start gap-6">
                    <div className="icon-modern bg-green-500">
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground mb-1">Correct Information</h3>
                      <p className="text-muted-foreground mb-3">Update or correct any inaccurate personal information</p>
                      <Button size="sm" variant="outline">Update Profile</Button>
                    </div>
                  </div>
                </div>
                
                <div className="card-modern p-8 hover-lift">
                  <div className="flex items-start gap-6">
                    <div className="icon-modern bg-red-500">
                      <Database className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground mb-1">Delete Your Account</h3>
                      <p className="text-muted-foreground mb-3">Request deletion of your account and associated data</p>
                      <Button size="sm" variant="outline" className="border-red-200 text-red-700 hover:bg-red-50">Delete Account</Button>
                    </div>
                  </div>
                </div>
                
                <div className="card-modern p-8 hover-lift">
                  <div className="flex items-start gap-6">
                    <div className="icon-modern bg-purple-500">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground mb-1">Data Portability</h3>
                      <p className="text-muted-foreground mb-3">Export your data in a structured, commonly used format</p>
                      <Button size="sm" variant="outline">Export Data</Button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section id="contact" data-animate>
              <div className="flex items-start gap-4 mb-2">
                <div className="icon-premium">
                  <Mail className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-1">6. Contact Us</h2>
                  <div className="w-16 h-1 gradient-primary rounded-full"></div>
                </div>
              </div>
              <div className="card-premium p-8">
                <p className="text-lg text-muted-foreground leading-relaxed mb-2">
                  If you have questions about this Privacy Policy or want to exercise your rights, please contact us:
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="card-modern p-6 text-center hover-lift">
                    <div className="icon-modern bg-success mb-4 mx-auto">
                      <Mail className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">Email Support</h3>
                    <a href="mailto:support@payvat.ie" className="text-primary hover:text-primary/80 font-semibold transition-colors">
                      support@payvat.ie
                    </a>
                    <p className="text-sm text-muted-foreground mt-2">Response within 24 hours</p>
                  </div>
                  
                  <div className="card-modern p-6 text-center hover-lift">
                    <div className="icon-modern bg-blue-500 mb-4 mx-auto">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">Data Protection Officer</h3>
                    <a href="mailto:dpo@payvat.ie" className="text-primary hover:text-primary/80 font-semibold transition-colors">
                      dpo@payvat.ie
                    </a>
                    <p className="text-sm text-muted-foreground mt-2">For privacy-specific inquiries</p>
                  </div>
                </div>
              </div>
            </section>
            
            </div>
          </div>
        </div>
      </div>

      {/* Live Chat */}

      {/* Footer */}
      <Footer />
    </div>
  )
}