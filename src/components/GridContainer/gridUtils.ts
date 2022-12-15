import { Cartesian2, Cartesian3, Rectangle, Math as CesiumMath, Cartographic, Color } from 'cesium';
import { useCesium } from 'resium';

const DENSITY = 7;

const MINS = [
  0.00675, 0.0125, 0.025, 0.05, 0.1, 0.2, 0.5, 1.0, 2.0, 5.0, 10.0
].map(CesiumMath.toRadians);

const GRANULARITY = CesiumMath.toRadians(3);

export const gridPrecision = (dDeg: number): number => {
  if (dDeg < 0.01) return 3;
  if (dDeg < 0.1) return 2;
  if (dDeg < 1) return 1;
  return 0;
};

export const useScreenCenterPosition = (): Cartographic => {
  const { scene } = useCesium();

  if (!scene) return Cartographic.fromCartesian(Cartesian3.fromDegrees(0, 0, 0));;

  const { canvas, camera } = scene;
  const center = new Cartesian2(
    Math.round(canvas.clientWidth / 2),
    Math.round(canvas.clientHeight / 2)
  );

  const cartesian = Cartographic.fromCartesian(
    camera.pickEllipsoid(center) ?? Cartesian3.fromDegrees(0, 0, 0)
  );

  return cartesian;
};

export const convertDEGToDMS = (deg: number, lat: boolean): string => {
  const absolute = Math.abs(deg);

  const degrees = ~~absolute;
  const minutesNotTruncated = (absolute - degrees) * 60;
  const minutes = ~~minutesNotTruncated;
  const seconds = ((minutesNotTruncated - minutes) * 60).toFixed(2);

  let minSec = '';
  if (minutes || seconds !== '0.00') minSec += `${minutes}'`;
  if (seconds !== '0.00') minSec += `${minutes}'`;

  return `${degrees}°${minSec.padStart(2, '0')}${
    lat ? (deg >= 0 ? 'N' : 'S') : deg >= 0 ? 'E' : 'W'
  }`;
};

export const useExtentView = (): Rectangle => {
  const { scene, globe } = useCesium();

  if (!(scene && globe)) return Rectangle.MAX_VALUE;

  const { camera, canvas } = scene;
  const { ellipsoid } = globe;

  const corners = [
    camera.pickEllipsoid(new Cartesian2(0, 0), ellipsoid) || Cartesian3.ZERO,
    camera.pickEllipsoid(new Cartesian2(canvas.width, 0), ellipsoid) ||
      Cartesian3.ZERO,
    camera.pickEllipsoid(new Cartesian2(0, canvas.height), ellipsoid) ||
      Cartesian3.ZERO,
    camera.pickEllipsoid(
      new Cartesian2(canvas.width, canvas.height),
      ellipsoid
    ) || Cartesian3.ZERO
  ];

  if(corners.indexOf(Cartesian3.ZERO) !== -1) return Rectangle.MAX_VALUE;

  return Rectangle.fromCartographicArray(
    ellipsoid.cartesianArrayToCartographicArray(corners)
  );
}

export interface LatLonLine {
  path: Cartographic[];
  color: Color;
  lon: number;
  lat: number;
  text: string;
}

export const drawGrid = (extent: Rectangle): { lonsLines: LatLonLine[], latsLines: LatLonLine[] } => {
  const latsLines: LatLonLine[] = [];
  const lonsLines: LatLonLine[] = [];

  let dLat = 0;
  let dLng = 0;
  // get the nearest to the calculated value
  for (let index = 0; index < MINS.length && dLat < (extent.north - extent.south) / DENSITY; index++) {
    dLat = MINS[index];
  }
  for ( let index = 0; index < MINS.length && dLng < (extent.east - extent.west) / DENSITY; index++ ) {
    dLng = MINS[index];
  }

  // round iteration limits to the computed grid interval
  let minLng =
    (extent.west < 0
      ? Math.ceil(extent.west / dLng)
      : Math.floor(extent.west / dLng)) * dLng;
  let minLat =
    (extent.south < 0
      ? Math.ceil(extent.south / dLat)
      : Math.floor(extent.south / dLat)) * dLat;
  let maxLng =
    (extent.east < 0
      ? Math.ceil(extent.east / dLat)
      : Math.floor(extent.east / dLat)) * dLat;
  let maxLat =
    (extent.north < 0
      ? Math.ceil(extent.north / dLng)
      : Math.floor(extent.north / dLng)) * dLng;

  // extend to make sure we cover for non refresh of tiles
  minLng = Math.max(minLng - 2 * dLng, -Math.PI);
  maxLng = Math.min(maxLng + 2 * dLng, Math.PI);
  minLat = Math.max(minLat - 2 * dLat, -Math.PI / 2);
  maxLat = Math.min(maxLat + 2 * dLng, Math.PI / 2);

  const latitudeText = minLat + Math.floor((maxLat - minLat) / dLat / 2) * dLat;

  for (let lon = minLng; lon < maxLng; lon += dLng) {
    // draw meridian
    const path = [];
    for (let lat = minLat; lat < maxLat; lat += GRANULARITY) {
      path.push(new Cartographic(lon, lat));
    }
    path.push(new Cartographic(lon, maxLat));
    const degLng = CesiumMath.toDegrees(lon);
    const text = convertDEGToDMS(
      parseFloat(degLng.toFixed(gridPrecision(dLng))),
      false
    );
    const color =
      text === '0°E' || text === '180°E' ? Color.YELLOW : Color.WHITE;
    if (text !== '180°W') {
      lonsLines.push({ color, lat: latitudeText, lon, text, path });
    }
  }

  // lats
  const longitudeText =
    minLng + Math.floor((maxLng - minLng) / dLng / 2) * dLng;
  for (let lat = minLat; lat < maxLat; lat += dLat) {
    // draw parallels
    const path = [];
    for (let lng = minLng; lng < maxLng; lng += GRANULARITY) {
      path.push(new Cartographic(lng, lat));
    }
    path.push(new Cartographic(maxLng, lat));
    const degLat = CesiumMath.toDegrees(lat);
    const text = convertDEGToDMS(
      parseFloat(degLat.toFixed(gridPrecision(dLat))),
      true
    );
    const color = text === '0°N' ? Color.YELLOW : Color.WHITE.withAlpha(0.5);
    latsLines.push({ color, lat, lon: longitudeText, text, path });
  }

  return { latsLines, lonsLines }
};