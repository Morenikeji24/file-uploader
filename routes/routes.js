import { Router } from "express";
import fileController from "../controllers/controller.js";
import upload from "../middleware/upload.js";
import { requireAuth } from "../middleware/auth.js";
import passport from "../config/passport.js";
import multer from "multer";

export const router = Router();

router.get("/", requireAuth, fileController.getHomePage);
router.post(
  "/upload",
  requireAuth,
  (req, res, next) => {
    upload.single("file")(req, res, (error) => {
      if (error) {
        if (error instanceof multer.MulterError) {
          if (error.code === "LIMIT_FILE_SIZE") {
            return res.redirect(
              "/?error=File%20is%20too%20large.%20Maximum%20size%20is%2010MB.",
            );
          }
        }
        return res.redirect("/?error=" + encodeURIComponent(error.message));
      }
      next();
    });
  },
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
  (req, res, next) => {
    upload.single("file")(req, res, (error) => {
      if (error) {
        if (error instanceof multer.MulterError) {
          if (error.code === "LIMIT_FILE_SIZE") {
            return res.redirect(
              `/folders/${req.params.id}?error=File%20is%20too%20large.%20Maximum%20size%20is%2010MB.`,
            );
          }
        }

        return res.redirect(
          `/folders/${req.params.id}?error=${encodeURIComponent(error.message)}`,
        );
      }

      next();
    });
  },
  fileController.postIntoFolder,
);
router.get("/files/:id", requireAuth, fileController.getFile);
router.post("/folders/:id/share", requireAuth, fileController.shareFolder);
router.get("/share/folders/:token", fileController.viewSharedFolder);

export default router;
