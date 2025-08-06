# VAT PAY - Irish VAT Return Management System

A comprehensive web application for Irish businesses to submit and pay VAT returns, built with Next.js 15, TypeScript, and modern web technologies.

## 🚀 Features

### For Businesses
- **VAT Return Management**: Create, submit, and track VAT returns
- **Document Upload**: Secure document storage with automatic categorization  
- **Payment Processing**: Integrated Stripe payments for VAT obligations
- **Dashboard**: Comprehensive overview of returns, payments, and documents
- **Irish Compliance**: Built specifically for Irish VAT regulations

### For Administrators  
- **User Management**: Complete user oversight with detailed analytics
- **Document Review**: Review and manage all uploaded business documents
- **Payment Monitoring**: Real-time payment tracking and failure analysis
- **System Analytics**: Comprehensive reporting and performance metrics
- **Audit Logging**: Full audit trail of all system activities

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI Components
- **Backend**: Next.js API Routes, Node.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with secure httpOnly cookies
- **Payments**: Stripe Payment Processing
- **File Upload**: Secure multipart file handling
- **Security**: Comprehensive security headers and validation

## 📁 Project Structure

```
├── app/                    # Next.js App Router
│   ├── admin/             # Admin dashboard pages
│   ├── api/               # API routes
│   ├── dashboard/         # User dashboard
│   └── [pages]/           # Application pages
├── components/            # Reusable React components
├── lib/                   # Utility functions and configurations
├── prisma/               # Database schema and migrations
├── public/               # Static assets
└── uploads/              # File upload directory
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Stripe account (for payments)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pay-vat
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your actual values
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🔧 Configuration

### Required Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret key for JWT token signing |
| `STRIPE_SECRET_KEY` | Stripe secret key for payments |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret |
| `NEXTAUTH_SECRET` | NextAuth.js secret |
| `NEXTAUTH_URL` | Application URL |

### Database Setup

The application uses PostgreSQL with Prisma ORM. The schema includes:
- **Users**: Business account management
- **VAT Returns**: VAT submission tracking
- **Documents**: File upload management  
- **Payments**: Payment processing records
- **Audit Logs**: System activity tracking

### Payment Integration

Stripe is integrated for VAT payment processing:
- Secure payment intents
- Webhook handling for payment status updates
- Receipt generation and management
- Failure tracking and retry logic

## 🔐 Security Features

- **Authentication**: JWT-based with secure httpOnly cookies
- **Authorization**: Role-based access control (User, Admin, Super Admin)
- **Input Validation**: Comprehensive Zod schema validation
- **File Security**: Secure file upload with type and size validation
- **Rate Limiting**: API rate limiting and abuse prevention
- **Security Headers**: Comprehensive security headers configuration
- **Audit Logging**: Complete activity tracking for compliance

## 📊 Admin Features

### User Management
- View all registered users with detailed statistics
- Search and filter users by various criteria
- Monitor user activity and VAT compliance
- Track payment history and pending obligations

### Document Oversight  
- Review all uploaded business documents
- Monitor document processing and categorization
- Track document status and scanning results
- Generate document reports for compliance

### Payment Monitoring
- Real-time payment transaction monitoring
- Payment failure analysis and reporting
- Revenue tracking and analytics
- Payment method distribution analysis

### System Analytics
- Comprehensive system performance metrics
- User growth and engagement analytics
- Payment volume and success rate tracking
- Monthly and yearly trend analysis

## 🚀 Deployment

### Vercel Deployment

1. **Connect to Vercel**
   - Import your GitHub repository to Vercel
   - Configure environment variables in Vercel dashboard

2. **Database Setup**
   - Set up PostgreSQL database (Vercel Postgres recommended)
   - Update `DATABASE_URL` in Vercel environment variables

3. **Configure Build Settings**
   - Build Command: `npm run build`
   - Install Command: `npm install`
   - Output Directory: `.next`

4. **Environment Variables**
   - Add all required environment variables in Vercel dashboard
   - Ensure production Stripe keys are configured

### Production Considerations

- Use production PostgreSQL database
- Configure production Stripe keys
- Set up proper domain and SSL
- Enable monitoring and error tracking
- Configure backup and disaster recovery

## 🧪 Testing

```bash
# Run linting
npm run lint

# Type checking
npx tsc --noEmit

# Build test
npm run build
```

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login  
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile

### VAT Management
- `GET /api/vat` - List VAT returns
- `POST /api/vat` - Create VAT return
- `PUT /api/vat/[id]` - Update VAT return
- `POST /api/vat/calculate` - Calculate VAT amounts
- `POST /api/vat/submit` - Submit VAT return

### Payment Processing
- `POST /api/payments/create` - Create payment intent
- `POST /api/payments/confirm` - Confirm payment
- `GET /api/payments/[id]` - Get payment details
- `POST /api/payments/webhook` - Stripe webhook handler

### Admin Endpoints
- `GET /api/admin/users` - User management
- `GET /api/admin/documents` - Document oversight
- `GET /api/admin/payments` - Payment monitoring
- `GET /api/admin/analytics` - System analytics

## 📄 License

This project is proprietary software developed for Irish VAT compliance management.

## 🤝 Support

For support and questions, please contact the development team.

---

**Built with ❤️ for Irish businesses** 🍀