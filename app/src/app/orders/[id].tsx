import { OrderDetailsScreen } from '@/features/orders/OrderDetailsScreen';

/** Order details on their own page (littlekart.com /orders/:id, from the tracking page). */
export default function OrderDetailsPage() {
  return <OrderDetailsScreen embedded={false} />;
}
