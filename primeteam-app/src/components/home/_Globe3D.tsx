"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

type GlobeComponentType = React.ComponentType<any>;

type ArcDatum = {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  color: [string, string];
  initialGap: number;
};

type CountriesGeoJson = {
  features: any[];
};

const arcsData: ArcDatum[] = [
  {
    startLat: 34.0522,
    startLng: -118.2437,
    endLat: 35.6895,
    endLng: 139.6917,
    color: ["#06b6d4", "#3b82f6"],
    initialGap: 0.5,
  },
  {
    startLat: -33.9249,
    startLng: 18.4241,
    endLat: -37.8136,
    endLng: 144.9631,
    color: ["#10b981", "#eab308"],
    initialGap: 0.2,
  },
  {
    startLat: 25.2048,
    startLng: 55.2708,
    endLat: 40.7128,
    endLng: -74.006,
    color: ["#3b82f6", "#1d4ed8"],
    initialGap: 0.8,
  },
  {
    startLat: 55.7558,
    startLng: 37.6173,
    endLat: 39.9042,
    endLng: 116.4074,
    color: ["#eab308", "#10b981"],
    initialGap: 0.1,
  },
  {
    startLat: -33.4489,
    startLng: -70.6693,
    endLat: 25.7617,
    endLng: -80.1918,
    color: ["#3b82f6", "#06b6d4"],
    initialGap: 0.6,
  },
  {
    startLat: 51.5074,
    startLng: -0.1278,
    endLat: 1.3521,
    endLng: 103.8198,
    color: ["#1d4ed8", "#3b82f6"],
    initialGap: 0.9,
  },
  {
    startLat: 30.0444,
    startLng: 31.2357,
    endLat: -22.9068,
    endLng: -43.1729,
    color: ["#10b981", "#eab308"],
    initialGap: 0.4,
  },
  {
    startLat: 49.2827,
    startLng: -123.1207,
    endLat: 21.3069,
    endLng: -157.8583,
    color: ["#06b6d4", "#10b981"],
    initialGap: 0.7,
  },
];

const ringsData = arcsData.flatMap((arc) => [
  { lat: arc.startLat, lng: arc.startLng, color: arc.color[0] },
  { lat: arc.endLat, lng: arc.endLng, color: arc.color[1] },
]);

const POLYGON_ALTITUDE = 0.006;
const CONTACT_ALTITUDE = 0.0085;

export default function Globe3D() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const globeRef = useRef<any>(null);

  const [GlobeComponent, setGlobeComponent] =
    useState<GlobeComponentType | null>(null);
  const [countries, setCountries] = useState<CountriesGeoJson>({
    features: [],
  });
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    let active = true;

    import("react-globe.gl")
      .then((mod) => {
        if (active) {
          setGlobeComponent(() => mod.default as GlobeComponentType);
        }
      })
      .catch((error) => {
        console.error("Error loading react-globe.gl:", error);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateSize = () => {
      setSize({
        width: Math.max(1, el.clientWidth),
        height: Math.max(1, el.clientHeight),
      });
    };

    updateSize();

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(() => updateSize());
      observer.observe(el);
      return () => observer.disconnect();
    }

    window.addEventListener("resize", updateSize, { passive: true });
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    fetch(
      "https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson",
      { signal: controller.signal }
    )
      .then((res) => res.json())
      .then((data) => {
        setCountries({
          features: Array.isArray(data?.features) ? data.features : [],
        });
      })
      .catch((error) => {
        if (error?.name !== "AbortError") {
          console.error("Error loading countries GeoJSON:", error);
        }
      });

    return () => controller.abort();
  }, []);

  const globeMaterial = useMemo(() => {
    return new THREE.MeshPhongMaterial({
      color: "#f3f5f7",
      emissive: "#ffffff",
      emissiveIntensity: 0.14,
      shininess: 4,
      specular: new THREE.Color("#eef2f6"),
      transparent: true,
      opacity: 1,
    });
  }, []);

  useEffect(() => {
    return () => {
      globeMaterial.dispose();
    };
  }, [globeMaterial]);

  useEffect(() => {
    const globe = globeRef.current;
    if (!globe || !size.width || !size.height) return;

    const controls = globe.controls?.();
    if (controls) {
      controls.autoRotate = true;
      controls.autoRotateSpeed = -0.42;
      controls.enableZoom = false;
      controls.enablePan = false;
      controls.enableRotate = false;
      controls.enableDamping = true;
      controls.dampingFactor = 0.06;
    }

    globe.pointOfView?.({ lat: 30, lng: -60, altitude: 2.2 }, 0);

    const renderer = globe.renderer?.();
    if (renderer) {
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setClearColor(0x000000, 0);
      renderer.sortObjects = true;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
    }

    const scene = globe.scene?.();
    if (scene) {
      scene.background = null;
    }
  }, [size.width, size.height, countries.features.length, GlobeComponent]);

  const GlobeAny = GlobeComponent as any;

  return (
    <div className="relative w-full h-full overflow-visible pointer-events-none select-none">
      <div ref={containerRef} className="absolute inset-0" aria-hidden="true">
        {GlobeAny && size.width > 0 && size.height > 0 && (
          <div className="absolute inset-0 flex items-center justify-center translate-x-[10%] translate-y-[14%] scale-[1.02]">
            <GlobeAny
              ref={globeRef}
              width={Math.round(size.width * 1.15)}
              height={Math.round(size.height * 1.15)}
              backgroundColor="rgba(0,0,0,0)"
              waitForGlobeReady={true}
              animateIn={false}
              showAtmosphere={true}
              atmosphereColor="#ffffff"
              atmosphereAltitude={0.08}
              globeMaterial={globeMaterial}
              polygonsData={countries.features}
              polygonCapColor={() => "#e3e8ef"}
              polygonSideColor={() => "rgba(0,0,0,0)"}
              polygonStrokeColor={() => "rgba(255,255,255,0)"}
              polygonAltitude={POLYGON_ALTITUDE}
              polygonsTransitionDuration={0}
              arcsData={arcsData}
              arcColor="color"
              arcStroke={0.25}
              arcStartAltitude={CONTACT_ALTITUDE}
              arcEndAltitude={CONTACT_ALTITUDE}
              arcDashLength={1}
              arcDashGap={1}
              arcDashInitialGap={(d: ArcDatum) => d.initialGap}
              arcDashAnimateTime={3000}
              arcAltitudeAutoScale={0.5}
              arcsTransitionDuration={0}
              ringsData={ringsData}
              ringColor="color"
              ringAltitude={CONTACT_ALTITUDE}
              ringMaxRadius={3}
              ringPropagationSpeed={1}
              ringRepeatPeriod={1000}
            />
          </div>
        )}
      </div>
    </div>
  );
}