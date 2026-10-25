// Logic behind Add / Edit Address (littlekart.com address modal, phone layout; DECISIONS D-63).
// Step 1: map with a fixed centre pin. Step 2: the form.
import {
  filterAddressName,
  normalizeAddressPhone,
  validateAddressForm,
  type Address,
  type AddressFormErrors,
} from '@littlekart/shared';
import * as Location from 'expo-location';
import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { deliveryProblem } from '@/features/location/useLocationPicker';
import { repos } from '@/services';
import { useAuthStore, useLocationStore } from '@/store';
import { strings } from '@/strings';
import type { MapViewHandle } from './MapView';

/** GPS fixes worse than this get the "drag the pin" hint (site value). */
const GOOD_ACCURACY_M = 55;
const MIN_QUERY = 3;
const DEBOUNCE_MS = 300;
/** Nalgonda bus stand: where the map opens when no delivery location is set yet. */
const FALLBACK_CENTER = { lat: 17.0557, lng: 79.2745 };

export interface Suggestion {
  text: string;
  lat: number;
  lng: number;
}

export interface AddressFormState {
  /** "Home", "Work", "Hotel" or the typed label. */
  label: string;
  /** "Other" chip is on and the "Save as" field shows. */
  customLabel: boolean;
  houseNo: string;
  landmark: string;
  name: string;
  phone: string;
}

/** `map` is the map's handle; it is only used inside callbacks (moving the map). */
export function useAddressEditor(map: RefObject<MapViewHandle | null>, editId: string | undefined, onDone: () => void) {
  const user = useAuthStore((s) => s.user);
  const selected = useLocationStore((s) => s.selected);
  const [initial] = useState(() => (selected ? { lat: selected.lat, lng: selected.lng } : FALLBACK_CENTER));

  const [center, setCenter] = useState(initial);
  const [text, setText] = useState('');
  const [message, setMessage] = useState('');
  const [dragging, setDragging] = useState(false);
  const [locating, setLocating] = useState(false);
  const [step, setStep] = useState<'map' | 'form'>('map');

  const [form, setForm] = useState<AddressFormState>({
    label: '',
    customLabel: false,
    houseNo: '',
    landmark: '',
    name: user?.name ?? '',
    phone: user?.phone ?? '',
  });
  const [errors, setErrors] = useState<AddressFormErrors>({});
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const requestId = useRef(0);
  const pinRequest = useRef(0);

  /** Checks the point is deliverable, then looks up its address (site: "Not deliverable" otherwise). */
  const resolvePoint = useCallback(async (lat: number, lng: number, after?: string) => {
    const id = ++pinRequest.current;
    setMessage(strings.address.fetching);
    const problem = await deliveryProblem(lat, lng);
    if (id !== pinRequest.current) return false;
    if (problem) {
      setMessage(strings.address.notDeliverable);
      setText('');
      return false;
    }
    setMessage(after ?? '');
    const found = await repos.address.reverseGeocode(lat, lng).catch(() => '');
    if (id !== pinRequest.current) return false;
    setText(found.trim() || strings.address.currentLocation);
    return true;
  }, []);

  const locateMe = useCallback(async () => {
    setLocating(true);
    setMessage(strings.address.fetching);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== Location.PermissionStatus.GRANTED) {
        setMessage(strings.location.permissionDenied);
        return;
      }
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
      const { latitude, longitude, accuracy } = position.coords;
      setCenter({ lat: latitude, lng: longitude });
      map.current?.moveTo(latitude, longitude, 17);
      const hint = accuracy !== null && accuracy > GOOD_ACCURACY_M ? strings.address.gpsAccuracy(Math.round(accuracy)) : '';
      await resolvePoint(latitude, longitude, hint);
    } catch {
      setMessage(strings.location.locationUnavailable);
    } finally {
      setLocating(false);
    }
  }, [map, resolvePoint]);

  // Opening Add New Address starts with the phone's location, as the site does; editing opens at the saved pin.
  useEffect(() => {
    if (!editId) {
      const timer = setTimeout(() => void locateMe(), 0);
      return () => clearTimeout(timer);
    }
    let active = true;
    repos.address
      .list()
      .then((list) => {
        const a = list.find((x) => x.id === editId);
        if (!active || !a) return;
        const preset = ['Home', 'Work', 'Hotel'].includes(a.label);
        setForm({ label: a.label, customLabel: !preset, houseNo: a.houseNo, landmark: a.landmark ?? '', name: a.name, phone: a.phone });
        setCenter({ lat: a.lat, lng: a.lng });
        setText(a.text);
        map.current?.moveTo(a.lat, a.lng, 17);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [editId, locateMe, map]);

  const onMapMoveStart = useCallback(() => setDragging(true), []);
  const onMapMoved = useCallback(
    (lat: number, lng: number) => {
      setDragging(false);
      setCenter({ lat, lng });
      void resolvePoint(lat, lng);
    },
    [resolvePoint],
  );

  // Location search: suggestions a moment after typing stops.
  useEffect(() => {
    const q = query.trim();
    if (q.length < MIN_QUERY) return;
    const id = ++requestId.current;
    const timer = setTimeout(() => {
      repos.address
        .autocomplete(q)
        .then((results) => id === requestId.current && setSuggestions(results))
        .catch(() => id === requestId.current && setSuggestions([]))
        .finally(() => {
          if (id !== requestId.current) return;
          setSearching(false);
          setSearched(true);
        });
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  const changeQuery = useCallback((value: string) => {
    setQuery(value);
    setMessage('');
    const long = value.trim().length >= MIN_QUERY;
    setSearching(long);
    setSearched(false);
    if (!long) {
      requestId.current += 1;
      setSuggestions([]);
    }
  }, []);

  const chooseSuggestion = useCallback(
    async (s: Suggestion) => {
      setCenter({ lat: s.lat, lng: s.lng });
      map.current?.moveTo(s.lat, s.lng, 17);
      const id = ++pinRequest.current;
      setMessage(strings.address.fetching);
      const problem = await deliveryProblem(s.lat, s.lng);
      if (id !== pinRequest.current) return;
      if (problem) {
        setMessage(strings.address.notDeliverable);
        setText('');
        return;
      }
      setMessage('');
      setText(s.text);
      // The field keeps the chosen place and its list closes.
      requestId.current += 1;
      setQuery(s.text);
      setSuggestions([]);
      setSearching(false);
      setSearched(false);
    },
    [map],
  );

  const update = useCallback((patch: Partial<AddressFormState>) => setForm((f) => ({ ...f, ...patch })), []);
  const pickPreset = useCallback((label: string) => update({ label, customLabel: false }), [update]);
  const toggleOther = useCallback(() => setForm((f) => ({ ...f, label: '', customLabel: !f.customLabel })), []);
  const setName = useCallback((v: string) => update({ name: filterAddressName(v) }), [update]);
  const setPhone = useCallback((v: string) => update({ phone: normalizeAddressPhone(v) }), [update]);

  const save = useCallback(async () => {
    const found = validateAddressForm({ ...form, text });
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    setSaveError('');
    setSaving(true);
    const address: Omit<Address, 'id'> = {
      label: form.label.trim(),
      text,
      houseNo: form.houseNo.trim(),
      landmark: form.landmark.trim() || undefined,
      name: form.name.trim(),
      phone: normalizeAddressPhone(form.phone),
      lat: center.lat,
      lng: center.lng,
    };
    try {
      if (editId) await repos.address.update(editId, address);
      else await repos.address.save(address);
      onDone();
    } catch (error) {
      const msg = error instanceof Error ? error.message.trim() : '';
      setSaveError(msg && !/failed to save address/i.test(msg) ? msg : strings.address.saveFailed);
    } finally {
      setSaving(false);
    }
  }, [center.lat, center.lng, editId, form, onDone, text]);

  return {
    initial,
    text,
    message,
    dragging,
    locating,
    step,
    canConfirm: !message && !!text,
    confirm: () => setStep('form'),
    backToMap: () => setStep('map'),
    locateMe,
    onMapMoveStart,
    onMapMoved,
    query,
    changeQuery,
    suggestions,
    searching,
    searched,
    showList: query.trim().length >= MIN_QUERY,
    chooseSuggestion,
    form,
    update,
    pickPreset,
    toggleOther,
    setName,
    setPhone,
    errors,
    saveError,
    saving,
    save,
  };
}

export type AddressEditor = ReturnType<typeof useAddressEditor>;
