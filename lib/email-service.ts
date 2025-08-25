// Email service for contact form notifications
// Note: This is a basic implementation - in production you would use services like:
// - SendGrid, Mailgun, AWS SES, or Resend for reliable email delivery
// - This implementation provides the structure for email notifications

interface EmailOptions {
  to: string
  subject: string
  html?: string
  text?: string
}

interface ContactSubmissionEmailData {
  fullName: string
  email: string
  subject: string
  message: string
  submissionId: string
}

export class EmailService {
  private static instance: EmailService
  
  private constructor() {
    // Initialize email service configuration
  }

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService()
    }
    return EmailService.instance
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      // In production, implement actual email sending logic here
      // For now, we'll log the email that would be sent
      console.log('📧 Email would be sent:', {
        to: options.to,
        subject: options.subject,
        preview: options.html ? options.html.substring(0, 100) + '...' : options.text?.substring(0, 100) + '...'
      })
      
      // Simulate email sending delay
      await new Promise(resolve => setTimeout(resolve, 100))
      
      return true
    } catch (error) {
      console.error('Email sending failed:', error)
      return false
    }
  }

  async sendContactConfirmationToCustomer(data: ContactSubmissionEmailData): Promise<boolean> {
    const subject = `Thank you for contacting PayVat.ie - We've received your ${data.subject.replace('-', ' ')} inquiry`
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .header { background: linear-gradient(135deg, #2A7A8F 0%, #1A4F5C 100%); padding: 20px; text-align: center; }
          .header h1 { color: white; margin: 0; }
          .content { padding: 30px 20px; }
          .message-box { background: #f8f9fa; border-left: 4px solid #2A7A8F; padding: 15px; margin: 20px 0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; }
          .btn { background: #2A7A8F; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>PayVat.ie</h1>
          <p style="color: #e3f2fd; margin: 5px 0;">Ireland's Premier VAT & Business Services</p>
        </div>
        
        <div class="content">
          <h2>Thank you for your inquiry, ${data.fullName}!</h2>
          
          <p>We've successfully received your inquiry about <strong>${data.subject.replace('-', ' ')}</strong> and wanted to confirm that your message has been delivered to our team.</p>
          
          <div class="message-box">
            <h3>Your Message:</h3>
            <p style="font-style: italic;">"${data.message.length > 200 ? data.message.substring(0, 200) + '...' : data.message}"</p>
          </div>
          
          <h3>What happens next?</h3>
          <ul>
            <li>📧 <strong>Response Time:</strong> We'll get back to you within 24 hours during business hours</li>
            <li>📞 <strong>Direct Contact:</strong> For urgent matters, you can reply to this email</li>
            <li>📋 <strong>Reference:</strong> Your inquiry ID is <code>${data.submissionId}</code></li>
          </ul>
          
          <p>In the meantime, feel free to explore our services or check out our frequently asked questions.</p>
          
          <a href="https://payvat.ie/services" class="btn">View Our Services</a>
          <a href="https://payvat.ie/faq" class="btn" style="background: #f8f9fa; color: #2A7A8F; border: 1px solid #2A7A8F;">FAQ</a>
        </div>
        
        <div class="footer">
          <p><strong>PayVat.ie</strong> - Making VAT Simple for Irish Businesses</p>
          <p>📧 support@payvat.ie | 🌐 <a href="https://payvat.ie">payvat.ie</a></p>
          <p style="font-size: 12px; margin-top: 15px;">
            This is an automated confirmation email. Please don't reply to this message - 
            our team will contact you directly at ${data.email} with a personalized response.
          </p>
        </div>
      </body>
      </html>
    `

    const text = `
      Thank you for contacting PayVat.ie!
      
      Hi ${data.fullName},
      
      We've received your inquiry about "${data.subject.replace('-', ' ')}" and wanted to confirm that your message has been delivered to our team.
      
      Your Message: "${data.message}"
      
      What happens next:
      - We'll respond within 24 hours during business hours
      - Your inquiry ID is: ${data.submissionId}
      - For urgent matters, you can reply to this email
      
      Visit payvat.ie for more information about our services.
      
      Best regards,
      The PayVat.ie Team
      
      ---
      PayVat.ie - Making VAT Simple for Irish Businesses
      Email: support@payvat.ie
      Web: https://payvat.ie
    `

    return await this.sendEmail({
      to: data.email,
      subject,
      html,
      text
    })
  }

  async sendContactNotificationToAdmin(data: ContactSubmissionEmailData): Promise<boolean> {
    const subject = `🔔 New Contact Form Submission - ${data.subject.replace('-', ' ')} - ${data.fullName}`
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .header { background: #1a4f5c; padding: 15px; color: white; }
          .urgent { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; margin: 10px 0; border-radius: 5px; }
          .content { padding: 20px; }
          .field { margin: 10px 0; padding: 10px; background: #f8f9fa; border-radius: 3px; }
          .field strong { color: #2A7A8F; }
          .message { background: #e8f4f8; padding: 15px; margin: 15px 0; border-left: 4px solid #2A7A8F; }
          .actions { margin: 20px 0; }
          .btn { background: #2A7A8F; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 5px; display: inline-block; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>🔔 New Contact Form Submission</h2>
          <p>Received: ${new Date().toLocaleString('en-IE')}</p>
        </div>
        
        <div class="content">
          <div class="field">
            <strong>Name:</strong> ${data.fullName}
          </div>
          <div class="field">
            <strong>Email:</strong> <a href="mailto:${data.email}">${data.email}</a>
          </div>
          <div class="field">
            <strong>Subject:</strong> ${data.subject.replace('-', ' ')}
          </div>
          <div class="field">
            <strong>Submission ID:</strong> ${data.submissionId}
          </div>
          
          <div class="message">
            <strong>Message:</strong><br>
            ${data.message.replace(/\n/g, '<br>')}
          </div>
          
          <div class="actions">
            <a href="mailto:${data.email}?subject=Re: Your inquiry about ${data.subject.replace('-', ' ')}" class="btn">Reply via Email</a>
            <a href="https://payvat.ie/admin/contacts" class="btn" style="background: #6c757d;">View in Admin Panel</a>
          </div>
          
          <div class="urgent">
            <strong>⏰ Response Required:</strong> Customer expects a response within 24 hours during business hours.
          </div>
        </div>
      </body>
      </html>
    `

    const text = `
      🔔 New Contact Form Submission
      
      Received: ${new Date().toLocaleString('en-IE')}
      
      Name: ${data.fullName}
      Email: ${data.email}
      Subject: ${data.subject.replace('-', ' ')}
      Submission ID: ${data.submissionId}
      
      Message:
      ${data.message}
      
      Action Required: Respond within 24 hours during business hours.
      
      Reply to: ${data.email}
      View in admin: https://payvat.ie/admin/contacts
    `

    // In production, send to admin email addresses
    const adminEmails = ['support@payvat.ie', 'admin@payvat.ie']
    
    for (const adminEmail of adminEmails) {
      await this.sendEmail({
        to: adminEmail,
        subject,
        html,
        text
      })
    }

    return true
  }

  async sendStatusUpdateNotification(data: ContactSubmissionEmailData, oldStatus: string, newStatus: string, adminNotes?: string): Promise<boolean> {
    // Only send status updates for significant changes
    const significantStatuses = ['responded', 'resolved']
    if (!significantStatuses.includes(newStatus)) {
      return true // Don't send notification for minor status changes
    }

    const statusMessages = {
      responded: 'We have responded to your inquiry',
      resolved: 'Your inquiry has been resolved'
    }

    const subject = `Update on your PayVat.ie inquiry - ${statusMessages[newStatus as keyof typeof statusMessages] || 'Status Updated'}`
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .header { background: linear-gradient(135deg, #2A7A8F 0%, #1A4F5C 100%); padding: 20px; text-align: center; color: white; }
          .content { padding: 30px 20px; }
          .status-update { background: #e8f4f8; border: 2px solid #2A7A8F; padding: 20px; margin: 20px 0; border-radius: 5px; text-align: center; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>PayVat.ie</h1>
          <h2>Inquiry Status Update</h2>
        </div>
        
        <div class="content">
          <p>Hi ${data.fullName},</p>
          
          <div class="status-update">
            <h3>✅ ${statusMessages[newStatus as keyof typeof statusMessages]}</h3>
            <p>Your inquiry about "${data.subject.replace('-', ' ')}" has been updated.</p>
            <p><strong>Reference ID:</strong> ${data.submissionId}</p>
          </div>
          
          ${adminNotes ? `
            <div style="background: #fff3cd; padding: 15px; margin: 20px 0; border-radius: 5px;">
              <h4>📝 Additional Notes:</h4>
              <p>${adminNotes}</p>
            </div>
          ` : ''}
          
          <p>If you have any further questions, please don't hesitate to reply to this email or contact us directly.</p>
          
          <p>Thank you for choosing PayVat.ie!</p>
        </div>
        
        <div class="footer">
          <p><strong>PayVat.ie</strong> - Making VAT Simple for Irish Businesses</p>
          <p>📧 support@payvat.ie | 🌐 <a href="https://payvat.ie">payvat.ie</a></p>
        </div>
      </body>
      </html>
    `

    return await this.sendEmail({
      to: data.email,
      subject,
      html
    })
  }
}

export default EmailService.getInstance()