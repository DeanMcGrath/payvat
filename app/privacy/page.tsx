export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
          
          <div className="prose prose-lg max-w-none space-y-6">
            <p className="text-sm text-gray-600 mb-8">
              <strong>Last updated:</strong> {new Date().toLocaleDateString()}
            </p>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Information We Collect</h2>
              <p className="text-gray-700 mb-4">
                When you use PayVAT, we collect information you provide directly to us, such as:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Account information (email, business name, VAT number)</li>
                <li>Document uploads for VAT processing</li>
                <li>Payment information (processed securely through Stripe)</li>
                <li>Communication data when you contact us</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">2. How We Use Your Information</h2>
              <p className="text-gray-700 mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Provide and improve our VAT processing services</li>
                <li>Process your documents and generate VAT returns</li>
                <li>Handle payments and billing</li>
                <li>Communicate with you about your account and services</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Information Sharing</h2>
              <p className="text-gray-700 mb-4">
                We do not sell or rent your personal information. We may share information only:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>With service providers who help us operate our services</li>
                <li>When required by law or to protect our rights</li>
                <li>With your consent</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Data Security</h2>
              <p className="text-gray-700">
                We implement appropriate security measures to protect your information against 
                unauthorized access, alteration, disclosure, or destruction. All sensitive data 
                is encrypted in transit and at rest.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Your Rights</h2>
              <p className="text-gray-700 mb-4">
                You have the right to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Access your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Delete your account and data</li>
                <li>Export your data</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Contact Us</h2>
              <p className="text-gray-700">
                If you have questions about this Privacy Policy, please contact us at:
              </p>
              <p className="text-gray-700 mt-2">
                <strong>Email:</strong> <a href="mailto:support@payvat.ie" className="text-teal-600 hover:underline">support@payvat.ie</a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}