import { prisma } from "../lib/prisma.js";
import bcrypt from "bcryptjs";

const fileController = {
  async getHomePage(req, res) {
    res.render("index");
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
    } catch (err) {
      console.log(err);
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
};

export default fileController;
