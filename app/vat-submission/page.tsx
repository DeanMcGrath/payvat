import ProtectedRoute from "../../components/protected-route"
import VATSubmission from "../../page-4-vat-submission"

export default function VATSubmissionPage() {
  return (
    <ProtectedRoute requiresSubscription={true}>
      <VATSubmission />
    </ProtectedRoute>
  )
}
