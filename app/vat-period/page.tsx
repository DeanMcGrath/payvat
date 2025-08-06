import ProtectedRoute from "../../components/protected-route"
import VATPeriod from "../../page-3-vat-period"

export default function VATPeriodPage() {
  return (
    <ProtectedRoute requiresSubscription={true}>
      <VATPeriod />
    </ProtectedRoute>
  )
}
