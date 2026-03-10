import type React from "react";

export type Masonry<T> = T & { gap: string; maxcolwidth: string };

declare global {
  namespace react.createElement.JSX {
    interface IntrinsicElements {
      "masonry-layout": Masonry<React.HTMLAttributes<HTMLDivElement>>;
    }
  }
}

// Tipado de respuesta para imágenes
export interface CloudinaryImageType {
  public_id?: string;
  format?: string;
  version?: number;
  resource_type?: string;
  type?: string;
  created_at?: string;
  bytes?: number;
  width: number;
  height: number;
  url: string;
  secure_url?: string;
  tags?: string[];
  aspectRatio?: number;
}

export interface CloudinaryOptimizedImage {
  highResURL?: string;
  optimizedUrl?: string;
  placeholderUrl?: string;
  tags?: string[];
  url?: string;
  width: number;
  height: number;
  aspectRatio?: number;
}

export interface Position {
  x: number;
  y: number;
  scale: number;
}

export interface Region {
  center: { x: number; y: number };
  count: number;
}

export interface GalleryItem {
  id: number;
  url: string;
  fullUrl: string;
  placeholderUrl?: string;
  title: string;
  meta: string;
  x: number;
  y: number;
  w: number;
  h: number;
  regionKey: string;
  width: number;
  height: number;
  z: number;
  rotateX: number;
  rotateY: number;
  rotateZ: number;
}
