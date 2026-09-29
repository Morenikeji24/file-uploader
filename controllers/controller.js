import { prisma } from "../lib/prisma.js";
import bcrypt from "bcryptjs";

const fileController = {
  async getHomePage(req, res) {
    const folders = await prisma.folder.findMany({
      where: {
        userId: req.user.id,
        parentId: null,
      },
      orderBy: {
        name: "asc",
      },
    });

    const files = await prisma.file.findMany({
      where: {
        userId: req.user.id,
        folderId: null,
      },
      orderBy: {
        filename: "asc",
      },
    });
    res.render("index", { folders, files });
  },

  async uploadFile(req, res) {
    await prisma.file.create({
      data: {
        filename: req.file.originalname,
        filepath: req.file.path,
        size: req.file.size,
        userId: req.user.id,
      },
    });
    res.redirect("/");
  },

  async registerUser(req, res) {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
      await prisma.user.create({
        data: {
          email: email,
          password: hashedPassword,
        },
      });

      res.redirect("/login");
    } catch (error) {
      console.log(error);
      res.status(500).send("Registration failed");
    }
  },

  async getRegister(req, res) {
    res.render("sign-up");
  },

  async getLogin(req, res) {
    res.render("login");
  },

  async logout(req, res, next) {
    req.logout((err) => {
      if (err) {
        return next(err);
      }

      res.redirect("/login");
    });
  },

  async createFolder(req, res) {
    try {
      const parentId = req.body.parentId ? Number(req.body.parentId) : null;

      if (parentId) {
        const parentFolder = await prisma.folder.findFirst({
          where: {
            id: parentId,
            userId: req.user.id,
          },
        });

        if (!parentFolder) {
          return res.status(500).send("Parent folder not found");
        }
      }
      await prisma.folder.create({
        data: {
          name: req.body.name,
          userId: req.user.id,
          parentId,
        },
      });

      if (parentId) {
        return res.redirect(`/folders/${parentId}`);
      }

      res.redirect("/");
    } catch (error) {
      console.log(error);
      res.status(500).send("Failed to create folder");
    }
  },

  async getFolder(req, res) {
    try {
      const folder = await prisma.folder.findFirst({
        where: {
          id: Number(req.params.id),
          userId: req.user.id,
        },
        include: {
          children: true,
          files: true,
        },
      });

      if (!folder) {
        return res.status(404).send("Folder not found");
      }

      res.render("folder", { folder });
    } catch (error) {
      console.log(error);
      res.status(500).send("Failed to find folder");
    }
  },

  async postIntoFolder(req, res) {
    try {
      const folder = await prisma.folder.findFirst({
        where: {
          id: Number(req.params.id),
          userId: req.user.id,
        },
      });

      if (!folder) {
        return res.status(404).send("Folder not found");
      }

      await prisma.file.create({
        data: {
          filename: req.file.originalname,
          filepath: req.file.path,
          size: req.file.size,
          userId: req.user.id,
          folderId: Number(req.params.id),
        },
      });

      res.redirect(`/folders/${req.params.id}`);
    } catch (error) {
      console.log(error);
      res.status(500).send("Failed to upload file");
    }
  },
};

export default fileController;
