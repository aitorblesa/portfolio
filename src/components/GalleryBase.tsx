import {
  startTransition,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from "react";
import Canvas from "./Canvas";
import FilterControls from "./FilterControls";
import GalleryModal from "./GalleryModal";
import ZoomControls from "./ZoomControls";
import { buildGalleryData, buildRegions, getRegionLabels } from "./galleryData";
import type {
  CloudinaryOptimizedImage,
  GalleryItem,
  Position,
} from "./types/types";

interface GalleryBaseProps {
  images: CloudinaryOptimizedImage[];
}

const INITIAL_POSITION: Position = { x: 0, y: 0, scale: 1 };
const MIN_SCALE = 0.35;
const MAX_SCALE = 1.2;

type ViewInsets = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

const getBoundsForItems = (items: GalleryItem[]) => {
  if (items.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 1, height: 1 };
  }

  const minX = Math.min(...items.map((item) => item.x));
  const minY = Math.min(...items.map((item) => item.y));
  const maxX = Math.max(...items.map((item) => item.x + item.w));
  const maxY = Math.max(...items.map((item) => item.y + item.h));

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: Math.max(maxX - minX, 1),
    height: Math.max(maxY - minY, 1),
  };
};

export default function GalleryBase({ images }: GalleryBaseProps) {
  const regions = useMemo(() => buildRegions(images), [images]);
  const galleryData = useMemo(
    () => buildGalleryData(images, regions),
    [images, regions],
  );
  const categories = useMemo(
    () => [{ key: "All", label: "All" }, ...getRegionLabels(regions)],
    [regions],
  );

  const [activeRegion, setActiveRegion] = useState("All");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [renderPos, setRenderPos] = useState<Position>(INITIAL_POSITION);

  const posRef = useRef<Position>(INITIAL_POSITION);
  const dragRef = useRef({
    isDragging: false,
    startX: 0,
    startY: 0,
    initialPointerX: 0,
    initialPointerY: 0,
    hasDragged: false,
  });
  const velocityRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);
  const transitionTimerRef = useRef<number | null>(null);

  const displayedGalleryData = useMemo(
    () =>
      galleryData.filter(
        (item) => activeRegion === "All" || item.regionKey === activeRegion,
      ),
    [activeRegion, galleryData],
  );

  const updateRenderPos = () => setRenderPos({ ...posRef.current });

  const getResetInsets = (): ViewInsets => {
    if (window.innerWidth < 768) {
      return { top: 96, right: 24, bottom: 148, left: 24 };
    }

    return { top: 450, right: 0, bottom: 170, left: 600 };
  };

  const fitItemsInView = (items: GalleryItem[], insets?: ViewInsets) => {
    if (typeof window === "undefined" || items.length === 0) return;

    const bounds = getBoundsForItems(items);
    const viewInsets = insets || { top: 50, right: 50, bottom: 50, left: 50 };
    const availableWidth = Math.max(
      window.innerWidth - viewInsets.left - viewInsets.right,
      1,
    );
    const availableHeight = Math.max(
      window.innerHeight - viewInsets.top - viewInsets.bottom,
      1,
    );
    const scale = Math.max(
      MIN_SCALE,
      Math.min(
        MAX_SCALE,
        Math.min(
          availableWidth / bounds.width,
          availableHeight / bounds.height,
        ),
      ),
    );
    const targetCenterX =
      viewInsets.left + availableWidth / 2 - window.innerWidth / 2;
    const targetCenterY =
      viewInsets.top + availableHeight / 2 - window.innerHeight / 2;

    posRef.current.scale = scale;
    posRef.current.x = targetCenterX - (bounds.minX + bounds.width / 2) * scale;
    posRef.current.y =
      targetCenterY - (bounds.minY + bounds.height / 2) * scale;
    updateRenderPos();
  };

  const stopAnimations = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (transitionTimerRef.current) {
      window.clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = null;
    }
  };

  const runTransition = (duration: number) => {
    setIsTransitioning(true);
    transitionTimerRef.current = window.setTimeout(() => {
      setIsTransitioning(false);
      transitionTimerRef.current = null;
    }, duration);
  };

  useEffect(() => {
    if (displayedGalleryData.length === 0) return;
    fitItemsInView(displayedGalleryData, getResetInsets());
  }, [displayedGalleryData]);

  useEffect(() => {
    const applyInertia = () => {
      if (dragRef.current.isDragging) return;

      if (
        Math.abs(velocityRef.current.x) < 0.1 &&
        Math.abs(velocityRef.current.y) < 0.1
      ) {
        rafRef.current = null;
        return;
      }

      posRef.current.x += velocityRef.current.x;
      posRef.current.y += velocityRef.current.y;
      velocityRef.current.x *= 0.94;
      velocityRef.current.y *= 0.94;

      updateRenderPos();
      rafRef.current = requestAnimationFrame(applyInertia);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!dragRef.current.isDragging) return;

      if (
        Math.abs(event.clientX - dragRef.current.initialPointerX) > 5 ||
        Math.abs(event.clientY - dragRef.current.initialPointerY) > 5
      ) {
        dragRef.current.hasDragged = true;
      }

      const newX = event.clientX - dragRef.current.startX;
      const newY = event.clientY - dragRef.current.startY;

      velocityRef.current = {
        x: newX - posRef.current.x,
        y: newY - posRef.current.y,
      };

      posRef.current.x = newX;
      posRef.current.y = newY;
      updateRenderPos();
    };

    const handlePointerUp = () => {
      if (!dragRef.current.isDragging) return;
      dragRef.current.isDragging = false;
      document.body.style.cursor = "";
      rafRef.current = requestAnimationFrame(applyInertia);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      stopAnimations();
      document.body.style.cursor = "";
    };
  }, []);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (isGalleryOpen) return;

    stopAnimations();
    dragRef.current.isDragging = true;
    dragRef.current.hasDragged = false;
    dragRef.current.initialPointerX = event.clientX;
    dragRef.current.initialPointerY = event.clientY;
    dragRef.current.startX = event.clientX - posRef.current.x;
    dragRef.current.startY = event.clientY - posRef.current.y;
    document.body.style.cursor = "grabbing";
  };

  const handleWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    if (isGalleryOpen) return;

    event.preventDefault();
    stopAnimations();

    const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
    const oldScale = posRef.current.scale;
    const newScale = Math.max(
      MIN_SCALE,
      Math.min(MAX_SCALE, oldScale * zoomFactor),
    );

    const pointerX = event.clientX;
    const pointerY = event.clientY;
    const viewportCenterX = window.innerWidth / 2;
    const viewportCenterY = window.innerHeight / 2;
    const xOnCanvas =
      (pointerX - viewportCenterX - posRef.current.x) / oldScale;
    const yOnCanvas =
      (pointerY - viewportCenterY - posRef.current.y) / oldScale;

    posRef.current.scale = newScale;
    posRef.current.x = pointerX - viewportCenterX - xOnCanvas * newScale;
    posRef.current.y = pointerY - viewportCenterY - yOnCanvas * newScale;
    updateRenderPos();
  };

  const panTo = (regionName: string) => {
    stopAnimations();
    startTransition(() => {
      setActiveRegion(regionName);
    });
    runTransition(700);
  };

  const adjustZoom = (factor: number) => {
    stopAnimations();
    posRef.current.scale = Math.max(
      MIN_SCALE,
      Math.min(MAX_SCALE, posRef.current.scale * factor),
    );
    updateRenderPos();
    runTransition(300);
  };

  const resetView = () => {
    stopAnimations();
    startTransition(() => {
      setActiveRegion("All");
    });
    fitItemsInView(galleryData, getResetInsets());
    runTransition(700);
  };

  const openImage = (id: number) => {
    if (dragRef.current.hasDragged) return;

    const idx = displayedGalleryData.findIndex((item) => item.id === id);
    if (idx < 0) return;

    setCurrentIdx(idx);
    setIsGalleryOpen(true);
  };

  const cycleImage = (direction: 1 | -1) => {
    if (displayedGalleryData.length === 0) return;
    setCurrentIdx((value) => {
      const nextIndex = value + direction;
      if (nextIndex < 0) return displayedGalleryData.length - 1;
      if (nextIndex >= displayedGalleryData.length) return 0;
      return nextIndex;
    });
  };

  return (
    <>
      <div
        className="fixed inset-0 overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12),_transparent_35%),linear-gradient(180deg,_rgba(0,0,0,0.92),_rgba(15,15,15,0.98))]"
        onPointerDown={handlePointerDown}
        onWheel={handleWheel}
      >
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:220px_220px]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.08),_transparent_55%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-between px-6 pt-24 md:px-10">
          <div className="max-w-sm rounded-2xl border border-white/10 bg-black/40 p-5 backdrop-blur-xl">
            <p className="text-3xl font-bold uppercase tracking-[0.3em] text-accent">
              Photography
            </p>

            <p className="mt-3 max-w-xs text-md leading-6 text-content/75">
              Navega por las distintas imágenes que descubren cada lugar.
            </p>
          </div>
          {/* <div className="hidden rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.24em] text-content/65 backdrop-blur-xl md:block">
        
              <p className="text-6xl">{displayedGalleryData.length}</p>
              <span className="mb-auto">imágenes</span>
           
          </div> */}
        </div>

        <Canvas
          pos={renderPos}
          galleryData={displayedGalleryData}
          isTransitioning={isTransitioning}
          onImageClick={openImage}
        />
      </div>

      <FilterControls
        activeRegion={activeRegion}
        categories={categories}
        onFilter={panTo}
      />

      <ZoomControls onZoom={adjustZoom} onReset={resetView} />

      <GalleryModal
        isOpen={isGalleryOpen}
        currentIdx={currentIdx}
        galleryData={displayedGalleryData}
        onClose={() => setIsGalleryOpen(false)}
        onNext={() => cycleImage(1)}
        onPrev={() => cycleImage(-1)}
      />
    </>
  );
}
