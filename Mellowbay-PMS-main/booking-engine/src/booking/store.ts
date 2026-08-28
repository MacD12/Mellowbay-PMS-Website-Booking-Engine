import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AvailabilityResult,
  BookingModel,
  Catalog,
  DEFAULT_PRICES,
  PriceConfig,
  RoomAvailability,
} from '../domain/index';
import { apiEnabled, catalogToPriceConfig, fetchAvailability, fetchCatalog } from './api';

/**
 * Everything the public booking flow reads, and nothing it writes.
 *
 * The rooms, rates, occupancy limits and currency are the PMS's — this only
 * fetches them. Setting any of it is the admin app's job.
 */

export interface CatalogState {
  catalog: Catalog | null;
  prices: PriceConfig;
  loading: boolean;
  /** Set when the PMS could not be reached and the site is quoting placeholders. */
  offline: boolean;
}

/**
 * The property's catalog, fetched once.
 *
 * With an API configured the site shows the PMS's rooms and rates. Without one
 * — or with one that is briefly down — it falls back to the bundled
 * placeholders, which keeps the page usable while making clear (via `offline`)
 * that the figures are not the property's.
 */
export function useCatalog(): CatalogState {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [loading, setLoading] = useState(apiEnabled);
  const [offline, setOffline] = useState(!apiEnabled);

  useEffect(() => {
    if (!apiEnabled) return;
    let cancelled = false;

    fetchCatalog()
      .then((c) => {
        if (cancelled) return;
        setCatalog(c);
        setOffline(false);
      })
      .catch(() => {
        // Unreachable API, or a property that has not been set up. Quoting from
        // the placeholders beats an empty page; the banner says they are not
        // the property's own figures.
        if (!cancelled) setOffline(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const prices = useMemo(
    () => (catalog ? catalogToPriceConfig(catalog) : DEFAULT_PRICES),
    [catalog],
  );

  return { catalog, prices, loading, offline };
}

export interface AvailabilityState {
  result: AvailabilityResult | null;
  loading: boolean;
  error: string | null;
  /** The row for one room type, or null if it was not quoted. */
  forRoomType: (roomTypeId: string) => RoomAvailability | null;
}

/**
 * Live price and availability for the chosen dates.
 *
 * Refetched whenever the dates, the party size or the model change, because
 * all three move the price: rates are per-date, occupancy supplements are
 * per-guest, and a model the property sells as a package is quoted off that
 * package's own rate plan. The in-flight request is aborted when they change
 * again so a slow earlier answer cannot overwrite a newer one.
 */
export function useAvailability(opts: {
  checkIn: string;
  checkOut: string;
  adults: number;
  model: BookingModel;
  enabled: boolean;
}): AvailabilityState {
  const { checkIn, checkOut, adults, model, enabled } = opts;
  const [result, setResult] = useState<AvailabilityResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abort = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!apiEnabled || !enabled) {
      setResult(null);
      return;
    }

    abort.current?.abort();
    const controller = new AbortController();
    abort.current = controller;
    setLoading(true);
    setError(null);

    fetchAvailability({ checkIn, checkOut, adults, model, signal: controller.signal })
      .then((r) => {
        if (controller.signal.aborted) return;
        setResult(r);
      })
      .catch((err: { message?: string }) => {
        if (controller.signal.aborted) return;
        // A stale price is worse than none: drop what was on screen rather than
        // leaving the previous dates' total under the new dates.
        setResult(null);
        setError(err?.message ?? 'Could not check availability.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [checkIn, checkOut, adults, model, enabled]);

  const forRoomType = useMemo(() => {
    const byId = new Map((result?.options ?? []).map((o) => [o.roomTypeId, o]));
    return (roomTypeId: string) => byId.get(roomTypeId) ?? null;
  }, [result]);

  return { result, loading, error, forRoomType };
}
