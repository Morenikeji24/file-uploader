import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "file-uploader",
    resource_type: "auto",
  },
});

const upload = multer({ storage });

export default upload;
