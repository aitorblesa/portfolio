import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import type { GalleryItem, Position } from "./types/types";
import "./styles/Gallery.css";

interface CanvasProps {
  pos: Position;
  galleryData: GalleryItem[];
  onImageClick: (idx: number) => void;
  isTransitioning: boolean;
}

function CanvasImage({
  item,
  onImageClick,
}: {
  item: GalleryItem;
  onImageClick: (idx: number) => void;
}) {
  const [inView, setInView] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setInView(true);
        observer.disconnect();
      },
      { rootMargin: "1200px" },
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, []);

  return (
    <button
      ref={ref}
      type="button"
      className="organic-image absolute overflow-hidden rounded-md border border-white/10 bg-black/20 shadow-2xl"
      style={
        {
          left: `${item.x}px`,
          top: `${item.y}px`,
          width: `${item.w}px`,
          height: `${item.h}px`,
          "--card-z": 1000 + item.z,
          "--card-opacity": `${Math.max(
            0.62,
            Math.min(0.94, 0.9 - item.z / 2600),
          )}`,
        } as CSSProperties
      }
      onMouseDown={(event) => {
        event.preventDefault();
      }}
      onClick={() => onImageClick(item.id)}
    >
      {item.placeholderUrl && (
        <img
          src={item.placeholderUrl}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          style={{
            filter: "blur(16px)",
            transform: "scale(1.04)",
            opacity: loaded ? 0 : 1,
            transition: "opacity 0.3s ease",
          }}
        />
      )}

      {inView && (
        <img
          src={item.url}
          alt={item.title}
          loading="lazy"
          decoding="async"
          className="pointer-events-none h-full w-full object-cover"
          onLoad={() => setLoaded(true)}
          style={{
            opacity: loaded ? 1 : 0,
            transition: "opacity 0.45s ease",
          }}
        />
      )}
    </button>
  );
}

export default function Canvas({
  pos,
  galleryData,
  onImageClick,
  isTransitioning,
}: CanvasProps) {
  return (
    <div
      className={`infinite-canvas absolute inset-0 ${isTransitioning ? "transition-transform duration-700 ease-out" : ""}`}
      style={{
        transform: `translate(${pos.x}px, ${pos.y}px) scale(${pos.scale})`,
      }}
    >
      <div className="canvas-stage absolute left-1/2 top-1/2">
        {galleryData.map((item) => (
          <CanvasImage key={item.id} item={item} onImageClick={onImageClick} />
        ))}
      </div>
    </div>
  );
}
