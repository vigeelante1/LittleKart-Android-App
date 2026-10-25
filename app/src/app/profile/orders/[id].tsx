import { router } from 'expo-router';
import { OrderDetailsScreen } from '@/features/orders/OrderDetailsScreen';
import { ProfileHeader } from '@/features/profile/ProfileHeader';
import { strings } from '@/strings';

/** Order details inside the profile (littlekart.com /profile/orders/:id). */
export default function ProfileOrderDetailsPage() {
  return (
    <OrderDetailsScreen
      embedded
      header={
        <ProfileHeader
          title={strings.profile.orders}
          onBack={() => (router.canGoBack() ? router.back() : router.replace('/profile/orders'))}
        />
      }
    />
  );
}
