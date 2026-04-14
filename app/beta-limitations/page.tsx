import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'PayVAT Beta Limitations',
  description: 'How PayVAT works today in paid beta, including current ROS and payment boundaries.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function BetaLimitationsPage() {
  return (
    <main className="min-h-screen bg-neutral-100">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-normal text-neutral-900">How PayVAT Works Today</h1>
        <p className="mt-3 text-neutral-700">
          PayVAT paid beta helps you prepare, review, record, export, and track VAT returns.
        </p>

        <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="text-lg font-normal text-amber-900">Important beta boundary</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-900">
            <li>PayVAT does not file the return directly with Revenue ROS in this beta.</li>
            <li>A PayVAT tracking reference is not a Revenue ROS confirmation.</li>
            <li>A PayVAT export is not a Revenue ROS filing receipt.</li>
            <li>Revenue payment completion remains external and is recorded in PayVAT.</li>
          </ul>
        </div>

        <div className="mt-8 rounded-xl border bg-white p-5">
          <h2 className="text-lg font-normal text-neutral-900">Need help?</h2>
          <p className="mt-2 text-sm text-neutral-700">
            Contact the team at <a className="text-[#2A7A8F] underline" href="mailto:support@payvat.ie">support@payvat.ie</a> or use the contact form.
          </p>
          <Link href="/contact" className="mt-3 inline-block text-sm font-normal text-[#2A7A8F] underline">
            Open support contact page
          </Link>
        </div>
      </div>
    </main>
  )
}

