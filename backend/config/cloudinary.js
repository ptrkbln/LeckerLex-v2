import cloudinary from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import crypto from "crypto";

// Configure Cloudinary with environment variables
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Set up Cloudinary storage with specific folder and file format constraints
const storage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: {
    folder: "LeckerLex-Review-Images", // Folder name in Cloudinary
    allowed_formats: ["jpeg", "png", "jpg", "webp", "avif"], // Accepted formats
    public_id: (req) => `${req.user.userId}-${crypto.randomUUID()}`,
  },
});

// Set up multer for file uploads, with a 5MB size limit
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
});
export default upload;
