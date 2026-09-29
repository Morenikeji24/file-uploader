import { Router } from "express";
import fileController from "../controllers/controller.js";
import upload from "../middleware/upload.js";
import { requireAuth } from "../middleware/auth.js";
import passport from "../config/passport.js";

export const router = Router();

router.get("/", requireAuth, fileController.getHomePage);
router.post(
  "/upload",
  requireAuth,
  upload.single("file"),
  fileController.uploadFile,
);
router.get("/sign-up", fileController.getRegister);
router.post("/sign-up", fileController.registerUser);
router.get("/login", fileController.getLogin);
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
  }),
);
router.post("/logout", fileController.logout);

router.post("/folders", requireAuth, fileController.createFolder);

router.get("/folders/:id", requireAuth, fileController.getFolder);
router.post(
  "/folders/:id/upload",
  requireAuth,
  upload.single("file"),
  fileController.postIntoFolder,
);

export default router;
