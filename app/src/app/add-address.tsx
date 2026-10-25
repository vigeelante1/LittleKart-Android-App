import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useCallback, useRef } from 'react';
import { FormStep } from '@/features/address/FormStep';
import { MapStep } from '@/features/address/MapStep';
import type { MapViewHandle } from '@/features/address/MapView';
import { useAddressEditor } from '@/features/address/useAddressEditor';
import { useAuthStore, useUiStore } from '@/store';

/**
 * Add / Edit Address (littlekart.com address modal, phone layout; DESIGN_SPEC S20).
 * Params: id = address to edit; from = "location" when opened from the location dialog (it reappears afterwards).
 */
export default function AddAddressScreen() {
  const { id, from } = useLocalSearchParams<{ id?: string; from?: string }>();
  const signedIn = useAuthStore((s) => s.user !== null);

  const leave = useCallback(() => {
    if (from === 'location') useUiStore.getState().setReopenLocationDialog(true);
    if (router.canGoBack()) router.back();
    else router.replace('/');
  }, [from]);

  const mapRef = useRef<MapViewHandle>(null);
  const editor = useAddressEditor(mapRef, id, leave);

  // The site asks to log in before saving addresses.
  if (!signedIn) return <Redirect href="/login" />;

  return editor.step === 'map' ? (
    <MapStep editor={editor} mapRef={mapRef} onClose={leave} />
  ) : (
    <FormStep editor={editor} editing={!!id} onCancel={leave} />
  );
}
