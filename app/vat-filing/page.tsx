export default function VATSubmissionPage() {
  // Redirect to the main VAT submission page
  if (typeof window !== 'undefined') {
    window.location.href = '/vat-submission'
  }
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Redirecting...</h1>
        <p>Taking you to the VAT submission page.</p>
      </div>
    </div>
  )
}
