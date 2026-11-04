// Loads the Google Maps JavaScript API in the browser, once, and types the few
// parts the van map uses. Rejects when the script can't load or Google refuses
// the key, so the screen can fall back to its status panel.

export type MapsLatLng = { lat: number; lng: number };

export interface MapsMap {
  fitBounds(bounds: MapsLatLngBounds, padding?: { top: number; right: number; bottom: number; left: number }): void;
}
export interface MapsMarker {
  setPosition(at: MapsLatLng): void;
  setMap(map: MapsMap | null): void;
}
export interface MapsPolyline {
  setMap(map: MapsMap | null): void;
}
export interface MapsLatLngBounds {
  extend(at: MapsLatLng): void;
}

export interface GoogleMapsApi {
  Map: new (el: HTMLElement, options: Record<string, unknown>) => MapsMap;
  Marker: new (options: Record<string, unknown>) => MapsMarker;
  Polyline: new (options: Record<string, unknown>) => MapsPolyline;
  LatLngBounds: new () => MapsLatLngBounds;
  Size: new (w: number, h: number) => unknown;
  Point: new (x: number, y: number) => unknown;
}

type MapsWindow = Window & {
  google?: { maps?: GoogleMapsApi };
  gm_authFailure?: () => void;
  __pavMapsReady?: () => void;
};

const TIMEOUT_MS = 15000;
let loading: Promise<GoogleMapsApi> | null = null;
const authFailureListeners = new Set<() => void>();

/**
 * Google often reports a refused key only once a map is drawn, after the
 * script has loaded. Subscribe to hear about it; returns an unsubscribe.
 */
export function onMapsAuthFailure(listener: () => void): () => void {
  authFailureListeners.add(listener);
  return () => authFailureListeners.delete(listener);
}

export function loadGoogleMaps(key: string): Promise<GoogleMapsApi> {
  if (loading) return loading;
  const w = window as MapsWindow;
  if (w.google?.maps) return (loading = Promise.resolve(w.google.maps));

  loading = new Promise<GoogleMapsApi>((resolve, reject) => {
    const fail = (why: string) => {
      loading = null;
      reject(new Error(why));
    };
    const timer = setTimeout(() => fail("Google Maps took too long to load"), TIMEOUT_MS);
    // Google calls this when the key is invalid or not allowed on this site.
    w.gm_authFailure = () => {
      clearTimeout(timer);
      fail("Google Maps refused the key");
      authFailureListeners.forEach((listener) => listener());
    };
    w.__pavMapsReady = () => {
      clearTimeout(timer);
      if (w.google?.maps) resolve(w.google.maps);
      else fail("Google Maps loaded without its API");
    };
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&v=weekly&loading=async&callback=__pavMapsReady`;
    script.async = true;
    script.onerror = () => {
      clearTimeout(timer);
      fail("Google Maps script failed to load");
    };
    document.head.appendChild(script);
  });
  return loading;
}
