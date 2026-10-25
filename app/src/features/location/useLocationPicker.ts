// Logic behind the location dialogs (littlekart.com location dialog, DECISIONS D-43):
// "Use Current Location", search with suggestions, saved addresses, and the delivery check that
// produces "Not deliverable — about 8.2 km away (delivers up to 6 km). Search your society or street."
import type { Address } from '@littlekart/shared';
import * as Location from 'expo-location';
import { useCallback, useEffect, useRef, useState } from 'react';
import { repos } from '@/services';
import { useAuthStore, useLocationStore, type DeliveryLocation } from '@/store';
import { strings } from '@/strings';

/** Suggestions start after this many characters. */
const MIN_QUERY = 3;
const DEBOUNCE_MS = 300;

export interface Suggestion {
  text: string;
  lat: number;
  lng: number;
}

/** Empty string when the point is deliverable, otherwise the message to show. */
export async function deliveryProblem(lat: number, lng: number): Promise<string> {
  try {
    const nearest = await repos.stores.nearest(lat, lng);
    if (!nearest) return strings.location.unableToVerify;
    if (!nearest.inRadius) {
      return nearest.distanceKm > 0
        ? strings.location.notDeliverableKm(nearest.distanceKm, nearest.store.deliveryRadiusKm)
        : strings.location.notDeliverableAt;
    }
    return '';
  } catch {
    return strings.location.unableToVerify;
  }
}

export function useLocationPicker(onDone: () => void) {
  const select = useLocationStore((s) => s.select);
  const user = useAuthStore((s) => s.user);

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selecting, setSelecting] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [message, setMessage] = useState('');
  /** Saved addresses for the logged-in user, tagged with whose they are. */
  const [savedFor, setSavedFor] = useState<{ userId: string; list: Address[] } | null>(null);
  const requestId = useRef(0);

  useEffect(() => {
    if (!user) return;
    let active = true;
    repos.address
      .list()
      .then((list) => {
        if (active) setSavedFor({ userId: user.id, list });
      })
      .catch(() => {
        if (!active) return;
        setSavedFor({ userId: user.id, list: [] });
        setMessage(strings.location.unableToVerify);
      });
    return () => {
      active = false;
    };
  }, [user]);

  const saved = user && savedFor?.userId === user.id ? savedFor.list : [];
  const loadingSaved = !!user && savedFor?.userId !== user.id;

  // Debounced suggestions while typing ("searching" is switched on by changeQuery).
  useEffect(() => {
    const q = query.trim();
    if (q.length < MIN_QUERY) return;
    const id = ++requestId.current;
    const timer = setTimeout(() => {
      repos.address
        .autocomplete(q)
        .then((results) => {
          if (id === requestId.current) setSuggestions(results);
        })
        .catch(() => {
          if (id === requestId.current) setSuggestions([]);
        })
        .finally(() => {
          if (id === requestId.current) {
            setSearching(false);
            setSearched(true);
          }
        });
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  const finish = useCallback(
    (location: DeliveryLocation) => {
      select(location);
      setMessage('');
      onDone();
    },
    [onDone, select],
  );

  const useCurrentLocation = useCallback(async () => {
    setLocating(true);
    setMessage(strings.location.fetching);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== Location.PermissionStatus.GRANTED) {
        setMessage(strings.location.permissionDenied);
        return;
      }
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const { latitude, longitude } = position.coords;
      const [text, problem] = await Promise.all([
        repos.address.reverseGeocode(latitude, longitude).catch(() => ''),
        deliveryProblem(latitude, longitude),
      ]);
      if (problem) {
        setMessage(problem);
        return;
      }
      finish({ label: '', text: text || strings.location.currentLocation, lat: latitude, lng: longitude });
    } catch {
      setMessage(strings.location.locationUnavailable);
    } finally {
      setLocating(false);
    }
  }, [finish]);

  const chooseSuggestion = useCallback(
    async (s: Suggestion) => {
      setSelecting(s.text);
      try {
        const problem = await deliveryProblem(s.lat, s.lng);
        if (problem) {
          setMessage(problem);
          return;
        }
        finish({ label: '', text: s.text, lat: s.lat, lng: s.lng });
      } finally {
        setSelecting(null);
      }
    },
    [finish],
  );

  const chooseSaved = useCallback(
    async (a: Address) => {
      const problem = await deliveryProblem(a.lat, a.lng);
      if (problem) {
        setMessage(problem);
        return;
      }
      finish({ label: a.name, addressLabel: a.label, text: a.text, lat: a.lat, lng: a.lng });
    },
    [finish],
  );

  const changeQuery = useCallback((text: string) => {
    setQuery(text);
    setMessage('');
    const long = text.trim().length >= MIN_QUERY;
    setSearching(long);
    setSearched(false);
    if (!long) {
      requestId.current += 1;
      setSuggestions([]);
    }
  }, []);

  return {
    query,
    changeQuery,
    suggestions,
    searching,
    /** A search finished: show "No locations found" when there are no suggestions. */
    searched,
    showList: query.trim().length >= MIN_QUERY,
    selecting,
    locating,
    message,
    saved,
    loadingSaved,
    useCurrentLocation,
    chooseSuggestion,
    chooseSaved,
  };
}

export type LocationPicker = ReturnType<typeof useLocationPicker>;
