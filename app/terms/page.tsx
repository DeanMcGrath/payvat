export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
          
          <div className="prose prose-lg max-w-none space-y-6">
            <p className="text-sm text-gray-600 mb-8">
              <strong>Last updated:</strong> {new Date().toLocaleDateString()}
            </p>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700">
                By accessing and using PayVAT, you accept and agree to be bound by the terms 
                and provision of this agreement. If you do not agree to these terms, you should 
                not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Service Description</h2>
              <p className="text-gray-700 mb-4">
                PayVAT provides automated VAT return processing services for Irish businesses, including:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Document analysis and VAT extraction</li>
                <li>Automated VAT return generation</li>
                <li>Secure document storage</li>
                <li>Payment processing for VAT submissions</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">3. User Responsibilities</h2>
              <p className="text-gray-700 mb-4">
                You agree to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Use the service only for legitimate business purposes</li>
                <li>Comply with all applicable Irish VAT regulations</li>
                <li>Review all generated VAT returns before submission</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Payment Terms</h2>
              <p className="text-gray-700 mb-4">
                Payment for services is due at the time of use. We accept payments via:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Credit and debit cards (processed securely via Stripe)</li>
                <li>Bank transfers for enterprise accounts</li>
              </ul>
              <p className="text-gray-700 mt-4">
                All fees are non-refundable unless otherwise specified.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Limitation of Liability</h2>
              <p className="text-gray-700">
                PayVAT provides automated assistance with VAT processing but does not replace 
                professional accounting advice. Users are responsible for reviewing all generated 
                returns and ensuring compliance with Irish Revenue requirements. We are not liable 
                for any penalties or issues arising from VAT submissions.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Data Protection</h2>
              <p className="text-gray-700">
                We are committed to protecting your data in accordance with GDPR and Irish data 
                protection laws. For details on how we collect and use your information, please 
                refer to our Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Service Availability</h2>
              <p className="text-gray-700">
                We strive to maintain high service availability but cannot guarantee uninterrupted 
                access. Scheduled maintenance will be communicated in advance where possible.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Termination</h2>
              <p className="text-gray-700">
                Either party may terminate this agreement at any time. Upon termination, your 
                access to the service will cease, but you remain responsible for any outstanding 
                payments.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Changes to Terms</h2>
              <p className="text-gray-700">
                We reserve the right to modify these terms at any time. Users will be notified 
                of significant changes via email or through the service interface.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Contact Information</h2>
              <p className="text-gray-700">
                For questions about these Terms of Service, please contact us at:
              </p>
              <p className="text-gray-700 mt-2">
                <strong>Email:</strong> <a href="mailto:support@payvat.ie" className="text-teal-600 hover:underline">support@payvat.ie</a>
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Governing Law</h2>
              <p className="text-gray-700">
                These terms are governed by Irish law and any disputes will be subject to the 
                jurisdiction of Irish courts.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}