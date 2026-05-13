import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary";

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: "uploads",
      resource_type: "auto", // IMPORTANT (supports images, pdf, etc.)
      allowed_formats: ["jpg", "png", "jpeg","pdf"],
    };
  },
});

const upload = multer({ storage });

export default upload;