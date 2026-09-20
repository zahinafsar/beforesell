import { v2 as cloudinary } from "cloudinary";

let configured = false;

function configureCloudinary() {
  if (configured) return;

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !/^[a-z0-9_-]+$/i.test(cloudName)) {
    throw new Error("CLOUDINARY_CLOUD_NAME is missing or malformed");
  }

  if (!apiKey || !/^\d+$/.test(apiKey)) {
    throw new Error("CLOUDINARY_API_KEY is missing or malformed");
  }

  if (!apiSecret || apiSecret.trim().length === 0) {
    throw new Error("CLOUDINARY_API_SECRET is missing or malformed");
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
  configured = true;
}

export interface UploadResult {
  url: string;
  publicId: string;
}

export async function uploadImage(
  file: File,
  folder: string = "listings"
): Promise<UploadResult> {
  configureCloudinary();
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const base64 = buffer.toString("base64");
  const dataUri = `data:${file.type};base64,${base64}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: `beforesell/${folder}`,
    resource_type: "image",
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
}

export async function uploadVideo(
  file: File,
  folder: string = "listings"
): Promise<UploadResult> {
  configureCloudinary();
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const base64 = buffer.toString("base64");
  const dataUri = `data:${file.type};base64,${base64}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: `beforesell/${folder}`,
    resource_type: "video",
    format: "mp4",
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
}

export async function deleteImage(publicId: string): Promise<void> {
  configureCloudinary();
  await cloudinary.uploader.destroy(publicId);
}

export async function deleteImages(publicIds: string[]): Promise<void> {
  if (publicIds.length === 0) return;
  configureCloudinary();
  await cloudinary.api.delete_resources(publicIds);
}

export async function deleteVideo(publicId: string): Promise<void> {
  configureCloudinary();
  await cloudinary.uploader.destroy(publicId, { resource_type: "video" });
}

export { cloudinary };
