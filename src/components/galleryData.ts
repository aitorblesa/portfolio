import type {
  CloudinaryOptimizedImage,
  GalleryItem,
  Region,
} from "./types/types";

const REGION_CLUSTER_RADIUS = 1100;
const REGION_OFFSET_RADIUS = 180;
const JITTER_X = 140;
const JITTER_Y = 120;

const seededRandom = (seed: number) => {
  const value = Math.sin(seed * 9999) * 10000;
  return value - Math.floor(value);
};

const formatRegionLabel = (value: string) =>
  value
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const getImageRegion = (image: CloudinaryOptimizedImage) => {
  const region = image.tags?.[0]?.trim();
  return region && region.length > 0 ? region : "Archive";
};

export const buildRegions = (
  images: CloudinaryOptimizedImage[],
): Record<string, Region> => {
  const counts = images.reduce<Record<string, number>>((acc, image) => {
    const key = getImageRegion(image);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const regionKeys = Object.keys(counts);

  return regionKeys.reduce<Record<string, Region>>((acc, key) => {
    acc[key] = {
      center: { x: 0, y: 0 },
      count: counts[key],
    };
    return acc;
  }, {});
};

export const buildGalleryData = (
  images: CloudinaryOptimizedImage[],
  regions: Record<string, Region>,
): GalleryItem[] => {
  const regionIndexes = new Map<string, number>();
  const regionKeys = Object.keys(regions);
  const regionOrder = new Map(regionKeys.map((key, index) => [key, index]));
  const totalRegions = Math.max(regionKeys.length, 1);

  return images.map((image, index) => {
    const regionKey = getImageRegion(image);
    const region = regions[regionKey];
    const regionItemIndex = regionIndexes.get(regionKey) || 0;
    regionIndexes.set(regionKey, regionItemIndex + 1);
    const regionIndex = regionOrder.get(regionKey) || 0;
    const regionPhase = (Math.PI * 2 * regionIndex) / totalRegions;

    const ratio = image.aspectRatio || image.width / image.height || 1;
    const width = 220 + seededRandom(index + 1) * 220;
    const height = width / ratio;
    const spreadAngle = seededRandom(index + 70) * Math.PI * 2;
    const spreadRadius =
      Math.pow(seededRandom(index + 80), 0.72) * REGION_CLUSTER_RADIUS;
    const regionOffsetX = Math.cos(regionPhase) * REGION_OFFSET_RADIUS;
    const regionOffsetY = Math.sin(regionPhase) * REGION_OFFSET_RADIUS;
    const x =
      region.center.x +
      regionOffsetX +
      Math.cos(spreadAngle) * spreadRadius +
      (seededRandom(index + 10) - 0.5) * JITTER_X;
    const y =
      region.center.y +
      regionOffsetY +
      Math.sin(spreadAngle) * spreadRadius * 0.82 +
      (seededRandom(index + 20) - 0.5) * JITTER_Y;
    const z = Math.round((seededRandom(index + 30) - 0.5) * 1400);
    const rotateX = (seededRandom(index + 40) - 0.5) * 10;
    const rotateY = (seededRandom(index + 50) - 0.5) * 14;
    const rotateZ = (seededRandom(index + 60) - 0.5) * 8;

    return {
      id: index,
      url: image.optimizedUrl || image.url || "",
      fullUrl: image.highResURL || image.optimizedUrl || image.url || "",
      placeholderUrl: image.placeholderUrl,
      title: formatRegionLabel(regionKey),
      meta: `${formatRegionLabel(regionKey)} - ${index + 1}`,
      x,
      y,
      w: width,
      h: height,
      regionKey,
      width: image.width,
      height: image.height,
      z,
      rotateX,
      rotateY,
      rotateZ,
    };
  });
};

export const getRegionLabels = (regions: Record<string, Region>) =>
  Object.keys(regions).map((key) => ({
    key,
    label: formatRegionLabel(key),
  }));
