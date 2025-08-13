"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useForm } from 'react-hook-form'
import { Mail, Phone, MessageCircle, Send, CheckCircle, AlertCircle } from 'lucide-react'
import Footer from "@/components/footer"
import SiteHeader from "@/components/site-header"

type ContactFormData = {
  fullName: string
  email: string
  phone: string
  companyName?: string
  subject: string
  message: string
}

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  
  const form = useForm<ContactFormData>({
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      companyName: '',
      subject: '',
      message: ''
    }
  })

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true)
    setSubmitStatus('idle')
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          source: 'contact-page',
          timestamp: new Date().toISOString()
        }),
      })

      if (response.ok) {
        setSubmitStatus('success')
        form.reset()
      } else {
        setSubmitStatus('error')
      }
    } catch (error) {
      console.error('Form submission error:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader 
        searchPlaceholder="Search contact information..."
        currentPage="Contact Us"
        pageSubtitle="Get in touch with our team"
      />

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-32 overflow-hidden bg-gradient-to-br from-teal-50 to-teal-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center">
            <div className="max-w-4xl mx-auto animate-fade-in">
              <div className="icon-premium mb-6 mx-auto">
                <MessageCircle className="h-12 w-12 text-white" />
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-teal-700">Get in Touch</span>
                <span className="block text-foreground mt-2">We're Here to Help</span>
              </h1>
              
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
                Have questions about VAT compliance or business setup? Our expert team is ready to provide the guidance you need.
              </p>
            </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute top-20 right-10 w-24 h-24 bg-gradient-to-br from-teal-400 to-teal-500 rounded-full blur-3xl opacity-20 animate-float"></div>
          <div className="absolute bottom-20 left-10 w-32 h-32 bg-gradient-to-br from-teal-400 to-teal-500 rounded-full blur-3xl opacity-20 animate-float" style={{animationDelay: '-2s'}}></div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-16 -mt-20 relative z-10">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <Card className="shadow-2xl border-0 bg-white">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-3xl font-bold text-teal-800 mb-4">
                Contact Our Team
              </CardTitle>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Fill out the form below and we'll get back to you within 24 hours during business hours.
              </p>
            </CardHeader>
            
            <CardContent className="p-8">
              {submitStatus === 'success' && (
                <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">Message sent successfully!</p>
                    <p className="text-sm text-green-600">We'll get back to you within 24 hours.</p>
                  </div>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="font-medium text-red-800">Something went wrong</p>
                    <p className="text-sm text-red-600">Please try again or email us directly at support@payvat.ie</p>
                  </div>
                </div>
              )}

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="fullName"
                      rules={{ required: "Full name is required" }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      rules={{ 
                        required: "Email is required",
                        pattern: {
                          value: /\S+@\S+\.\S+/,
                          message: "Please enter a valid email address"
                        }
                      }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="Enter your email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="phone"
                      rules={{ required: "Phone number is required" }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your phone number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="companyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your company name (optional)" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="subject"
                    rules={{ required: "Please select a subject" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select inquiry type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="general-inquiry">General Inquiry</SelectItem>
                            <SelectItem value="vat-services">VAT Services</SelectItem>
                            <SelectItem value="business-setup">Business Setup</SelectItem>
                            <SelectItem value="support">Support</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    rules={{ required: "Message is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Please describe how we can help you..."
                            rows={6}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="text-center pt-4">
                    <Button 
                      type="submit"
                      size="lg"
                      disabled={isSubmitting}
                      className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-12 py-3 min-w-[200px]"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Sending...
                        </>
                      ) : (
                        <>
                          Send Message
                          <Send className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Other Ways to Reach Us
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Prefer to contact us directly? Here are additional ways to get in touch.
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            <Card className="text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Email Support</h3>
                <p className="text-gray-600 mb-4">Get a response within 24 hours</p>
                <a href="mailto:support@payvat.ie" className="text-teal-600 font-medium hover:text-teal-700">
                  support@payvat.ie
                </a>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Phone Support</h3>
                <p className="text-gray-600 mb-4">Monday - Friday, 9:00 AM - 5:00 PM</p>
                <p className="text-teal-600 font-medium">Available via contact form</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Live Chat</h3>
                <p className="text-gray-600 mb-4">Real-time assistance available</p>
                <p className="text-teal-600 font-medium">Check bottom right corner</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}