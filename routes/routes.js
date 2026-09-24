import { Router } from "express";
import fileController from "../controllers/controller.js";
import upload from "../middleware/upload.js";

export const router = Router();

router.get("/", fileController.getHomePage);
router.post("/upload", upload.single("file"), fileController.uploadFile);

export default router;
