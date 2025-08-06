import ProtectedRoute from "../../components/protected-route"
import PaymentPage from "../../page-4-payment"

export default function PaymentPageRoute() {
  return (
    <ProtectedRoute requiresSubscription={true}>
      <PaymentPage />
    </ProtectedRoute>
  )
}
