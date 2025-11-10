import { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl, { Map as MapLibreMap, Marker, Popup } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { Drone } from '../types/drone';
import { getAllDrones } from '../api/drones';
import { useDronesSocket } from '../hooks/userDronesSocket';

const ISRAEL_CENTER: [number, number] = [34.85, 31.8];
const ISRAEL_ZOOM = 7;

type MarkerRecord = { marker: Marker; popup: Popup };

export default function MapView() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<globalThis.Map<number, MarkerRecord>>(new globalThis.Map());
  const [ready, setReady] = useState(false);
  const hoverPopupRef = useRef<Popup | null>(null);
  const hoveredIdRef = useRef<number | null>(null);
  const hideTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const style = {
      version: 8,
      sources: {
        osm: {
          type: 'raster',
          tiles: [
            'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
            'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
            'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
          ],
          tileSize: 256,
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        },
        carto: {
          type: 'raster',
          tiles: [
            'https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
            'https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
            'https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
            'https://d.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
          ],
          tileSize: 256,
          attribution: '&copy; OpenStreetMap contributors & CARTO',
        },
      },
      layers: [
        { id: 'osm', type: 'raster', source: 'osm' },
        { id: 'carto', type: 'raster', source: 'carto', layout: { visibility: 'none' } },
      ],
    } as any;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style,
      center: ISRAEL_CENTER,
      zoom: ISRAEL_ZOOM,
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');
    map.addControl(new maplibregl.AttributionControl({ compact: true }));

    map.on('load', () => {
      console.log('Map loaded ✔ (inline)');
      setReady(true);
      if (!hoverPopupRef.current) {
        hoverPopupRef.current = new maplibregl.Popup({
          closeButton: false,
          closeOnClick: false,
          offset: 12,
          className: 'drone-tooltip',
          maxWidth: '260px',
        });
      }
    });

    map.on('error', () => {
      try {
        map.setLayoutProperty('osm', 'visibility', 'none');
        map.setLayoutProperty('carto', 'visibility', 'visible');
        console.log('Switched to Carto fallback layer');
      } catch {}
    });

    mapRef.current = map;
    return () => {
      if (hideTimerRef.current !== null) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
      markersRef.current.forEach(({ marker }) => {
        const el = marker.getElement();
        if (el && (el as any)._popupEl) {
          const popupEl = (el as any)._popupEl;
          const onEnter = (el as any)._popupEnter;
          const onLeave = (el as any)._popupLeave;
          if (onEnter) popupEl.removeEventListener('mouseenter', onEnter);
          if (onLeave) popupEl.removeEventListener('mouseleave', onLeave);
        }
        marker.remove();
      });
      markersRef.current.clear();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  const addOrUpdateMarker = useCallback((drone: Drone) => {
    const map = mapRef.current;
    if (!map) return;

    const lngLat = [drone.longitude, drone.latitude] as [number, number];

    const existing = markersRef.current.get(drone.id);
    const speedVal = (('speed' in drone) && typeof (drone as any).speed === 'number') ? (drone as any).speed.toFixed(1) : 'N/A';
    const html = `
      <div style="font-size:12px; line-height:1.4">
        <b>ID:</b> ${drone.id}<br/>
        <b>Type:</b> ${drone.type}<br/>
        <b>Lat:</b> ${drone.latitude.toFixed(6)}<br/>
        <b>Lng:</b> ${drone.longitude.toFixed(6)}<br/>
        <b>Speed:</b> ${speedVal}
        <br/>
        <b>Created:</b> ${new Date(drone.createdAt).toLocaleString()}
      </div>
    `;

    if (existing) {
      existing.marker.setLngLat(lngLat);
      existing.popup.setHTML(html);
      if (hoveredIdRef.current === drone.id && hoverPopupRef.current) {
        if (hideTimerRef.current !== null) {
          clearTimeout(hideTimerRef.current);
          hideTimerRef.current = null;
        }
        hoverPopupRef.current.setLngLat(lngLat).setHTML(html);
      }
      return;
    }

    const el = document.createElement('div');
    el.style.width = '28px';
    el.style.height = '28px';
    el.style.borderRadius = '50%';
    el.style.background = `url('/icons/drone.png') center/contain no-repeat, #0ea5e9`;
    el.style.boxShadow = '0 0 0 2px white';
    el.style.cursor = 'pointer';
    el.style.pointerEvents = 'auto';

    const popup = new maplibregl.Popup({ offset: 18 }).setHTML(html);
    const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
      .setLngLat(lngLat)
      .setPopup(popup)
      .addTo(map);

    markersRef.current.set(drone.id, { marker, popup });

    if (!hoverPopupRef.current && map) {
      hoverPopupRef.current = new maplibregl.Popup({
        closeButton: false,
        closeOnClick: false,
        offset: 12,
        className: 'drone-tooltip',
        maxWidth: '260px',
      });
    }

    const clearHideTimer = () => {
      if (hideTimerRef.current !== null) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };

    const startHideTimer = () => {
      clearHideTimer();
      hideTimerRef.current = window.setTimeout(() => {
        if (hoverPopupRef.current && hoveredIdRef.current === drone.id) {
          hoveredIdRef.current = null;
          hoverPopupRef.current.remove();
        }
        hideTimerRef.current = null;
      }, 200);
    };

    el.addEventListener('mouseenter', () => {
      if (!hoverPopupRef.current || !map) return;
      clearHideTimer();
      hoveredIdRef.current = drone.id;
      hoverPopupRef.current.setLngLat(lngLat).setHTML(html).addTo(map);
      console.log('Hover on drone', drone.id);

      setTimeout(() => {
        const popupEl = hoverPopupRef.current?.getElement();
        if (popupEl && hoveredIdRef.current === drone.id) {
          const oldEl = (el as any)._popupEl;
          if (oldEl && oldEl !== popupEl) {
            const oldEnter = (el as any)._popupEnter;
            const oldLeave = (el as any)._popupLeave;
            if (oldEnter) oldEl.removeEventListener('mouseenter', oldEnter);
            if (oldLeave) oldEl.removeEventListener('mouseleave', oldLeave);
          }
          const onPopupEnter = () => clearHideTimer();
          const onPopupLeave = () => startHideTimer();
          popupEl.addEventListener('mouseenter', onPopupEnter);
          popupEl.addEventListener('mouseleave', onPopupLeave);
          (el as any)._popupEnter = onPopupEnter;
          (el as any)._popupLeave = onPopupLeave;
          (el as any)._popupEl = popupEl;
        }
      }, 0);
    });
    el.addEventListener('mouseleave', () => {
      if (!hoverPopupRef.current) return;
      if (hoveredIdRef.current === drone.id) {
        startHideTimer();
      }
    });

    el.addEventListener('click', () => {
      marker.togglePopup();
    });
  }, []);

  useEffect(() => {
    if (!ready) return;
    (async () => {
      try {
        const drones = await getAllDrones();
        drones.forEach(addOrUpdateMarker);
        console.log(`Loaded ${drones.length} drones (REST)`);
      } catch (e) {
        console.error('Failed to load drones:', e);
      }
    })();
  }, [ready, addOrUpdateMarker]);

  useDronesSocket(addOrUpdateMarker);

  return (
    <div style={{ width: '100%', height: '100vh', background: '#111', pointerEvents: 'auto' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
