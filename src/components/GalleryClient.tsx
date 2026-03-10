import { useState, useEffect, useRef } from "react";
import type { CloudinaryImageType } from "./types/types";

interface GalleryClientProps {
  images: CloudinaryImageType[];
  location: string;
}

function LazyImage({ image }: { image: CloudinaryImageType }) {
  const [inView, setInView] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px 0px", threshold: 0 },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  // Derive placeholder from Cloudinary URL
  const [base, imgPath] = image.url.split("upload/");
  const placeholderUrl = `${base}upload/w_20,h_20,c_fill,q_1,f_webp,e_blur:200/${imgPath}`;

  return (
    <div
      ref={ref}
      style={{
        position: "relative",
        width: "100%",
        overflow: "hidden",
        borderRadius: "6px",
        backgroundColor: "#1a1a1a",
      }}
    >
      {/* Tiny placeholder, always visible */}
      <img
        src={placeholderUrl}
        aria-hidden="true"
        alt=""
        className="w-full h-auto"
        style={{
          filter: "blur(12px)",
          transform: "scale(1.08)",
          opacity: loaded ? 0 : 1,
          transition: "opacity 0.6s ease",
          position: loaded ? "absolute" : "relative",
          inset: 0,
        }}
      />

      {/* Full image */}
      {inView && (
        <img
          className="rounded-md w-full h-auto"
          loading="lazy"
          decoding="async"
          src={image.url}
          alt="Gallery Image"
          onLoad={() => setLoaded(true)}
          style={{
            opacity: loaded ? 1 : 0,
            transition: "opacity 0.6s ease",
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      )}
    </div>
  );
}

export default function GalleryClient({
  images,
  location,
}: GalleryClientProps) {
  const filteredImages =
    location === "All"
      ? images
      : images.filter((img) => img.tags?.includes(location));

  return (
    <section id="gallery" className="mx-auto w-full grid gap-6">
      {filteredImages.length === 0 ? (
        <p className="text-center">No images found for "{location}"</p>
      ) : (
        filteredImages.map((image, index) => (
          <a key={index} href={image.url} target="_blank" rel="noreferrer">
            <LazyImage image={image} />
          </a>
        ))
      )}
    </section>
  );
}
