import { v2 as cloudinary } from "cloudinary";
import type { CloudinaryImageType } from "../components/types/types.ts";

cloudinary.config({
  cloud_name: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
  api_key: import.meta.env.VITE_CLOUDINARY_API_KEY,
  api_secret: import.meta.env.VITE_CLOUDINARY_API_SECRET,
});

export default cloudinary;

const CACHE_TTL_MS = 1000 * 60 * 10;

type CachedImagesEntry = {
  expiresAt: number;
  promise: Promise<CloudinaryImageType[]>;
};

const imagesCache = new Map<string, CachedImagesEntry>();

export const getImagesByTag = async (
  tag: string = "",
): Promise<CloudinaryImageType[]> => {
  const cacheKey = tag.trim() || "__all__";
  const cachedEntry = imagesCache.get(cacheKey);

  if (cachedEntry && cachedEntry.expiresAt > Date.now()) {
    return cachedEntry.promise;
  }

  const request = (async () => {
    try {
      const expression = tag ? `tags:${tag}` : `resource_type:image`;
      const response = await cloudinary.search
        .expression(expression)
        .max_results(500)
        .with_field("tags")
        .execute();
      return response.resources as CloudinaryImageType[];
    } catch (error) {
      imagesCache.delete(cacheKey);
      console.error("Error fetching images from Cloudinary:", error);
      return [];
    }
  })();

  imagesCache.set(cacheKey, {
    expiresAt: Date.now() + CACHE_TTL_MS,
    promise: request,
  });

  try {
    return await request;
  } catch (error) {
    console.error("Error fetching images from Cloudinary:", error);
    return [];
  }
};

export const optimizeImage = (image: CloudinaryImageType) => {
  const [base, imgPath] = image.url.split("upload/");

  // ~200 bytes — used as blur placeholder while full image loads
  const placeholderUrl = `${base}upload/w_24,h_24,c_fill,q_25,f_webp,e_blur:200/${imgPath}`;

  // Your existing transforms — kept exactly as-is
  const optimizedUrl = `${base}upload/c_limit,w_700,cs_srgb,dn_130,q_auto:low,f_webp/${imgPath}`;
  const highResURL = `${base}upload/c_limit,w_1000,cs_srgb,q_auto:good,f_webp/${imgPath}`;

  return {
    placeholderUrl,
    optimizedUrl,
    highResURL,
    width: image.width,
    height: image.height,
    aspectRatio: image.aspect_ratio || image.width / image.height,
    tags: image.tags,
  };
};
