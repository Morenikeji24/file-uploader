import { prisma } from "../lib/prisma.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";

async function getSharedFolderTree(folderId) {
  const folder = await prisma.folder.findUnique({
    where: {
      id: folderId,
    },
    include: {
      files: true,
      children: true,
    },
  });

  if (!folder) {
    return null;
  }

  folder.children = await Promise.all(
    folder.children.map((child) => getSharedFolderTree(child.id)),
  );

  return folder;
}

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
    res.render("index", { folders, files, error: req.query.error });
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

      res.render("folder", { folder, error: req.query.error });
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

  async getFile(req, res) {
    try {
      const file = await prisma.file.findFirst({
        where: {
          id: Number(req.params.id),
          userId: req.user.id,
        },
      });

      if (!file) {
        return res.status(404).send("File not found");
      }

      res.render("file", { file });
    } catch (error) {
      console.log(error);
      res.status(500).send("Failed to find file");
    }
  },

  async shareFolder(req, res) {
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

      const duration = Number(req.body.duration);

      if (!duration || duration <= 0) {
        return res.status(400).send("Invalid duration");
      }

      const shareToken = crypto.randomBytes(32).toString("hex");

      const shareExpiresAt = new Date(
        Date.now() + duration * 24 * 60 * 60 * 1000,
      );

      await prisma.folder.update({
        where: {
          id: folder.id,
        },
        data: {
          shareToken,
          shareExpiresAt,
        },
      });

      const shareUrl = `${req.protocol}://${req.get("host")}/share/folders/${shareToken}`;

      res.render("share", { shareUrl, folder, shareExpiresAt });
    } catch (error) {
      console.log(error);
      res.status(500).send("Failed to create share link");
    }
  },

  async viewSharedFolder(req, res) {
    try {
      const rootFolder = await prisma.folder.findUnique({
        where: {
          shareToken: req.params.token,
        },
        include: {
          files: true,
          children: true,
        },
      });

      if (!rootFolder) {
        return res.status(404).send("Share link not found");
      }

      if (
        !rootFolder.shareExpiresAt ||
        rootFolder.shareExpiresAt < new Date()
      ) {
        return res.status(410).send("This share link has expired");
      }

      res.render("shared-folder", {
        folder: rootFolder,
        token: req.params.token,
        rootFolder,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send("Failed to load shared folder");
    }
  },

  async viewSharedSubfolder(req, res) {
    try {
      const rootFolder = await prisma.folder.findUnique({
        where: {
          shareToken: req.params.token,
        },
      });

      if (!rootFolder) {
        return res.status(404).send("Share link not found");
      }

      if (
        !rootFolder.shareExpiresAt ||
        rootFolder.shareExpiresAt < new Date()
      ) {
        return res.status(410).send("This share link has expired");
      }

      const folder = await prisma.folder.findUnique({
        where: {
          id: Number(req.params.folderId),
        },
        include: {
          files: true,
          children: true,
        },
      });

      if (!folder) {
        return res.status(404).send("Folder not found");
      }

      let currentFolder = folder;

      while (currentFolder.parentId !== null) {
        currentFolder = await prisma.folder.findUnique({
          where: {
            id: currentFolder.parentId,
          },
        });

        if (!currentFolder) {
          return res.status(404).send("Folder not found");
        }

        if (currentFolder.id === rootFolder.id) {
          return res.render("shared-folder", {
            folder,
            token: req.params.token,
            rootFolder,
          });
        }
      }

      return res.status(403).send("Folder is not part of this share");
    } catch (error) {
      console.log(error);
      res.status(500).send("Failed to load shared folder");
    }
  },
};

export default fileController;
