import express from "express";
import fs from "fs";
import multer from "multer";
import cors from "cors";

import mongoose from "mongoose";
import UserModel from "./models/User.js"

import {
  registerValidation,
  loginValidation,
  postCreateValidation,
} from "./validations.js";

import { handleValidationErrors, checkAuth } from "./utils/index.js";

import { UserController, PostController } from "./controllers/index.js";

mongoose
  .connect(
    "mongodb+srv://admin:wwwwww@cluster0.wz8twgm.mongodb.net/blog?retryWrites=true&w=majority&appName=Cluster0"
  )
  .then(() => console.log("DB ok"))
  .catch((err) => console.log("DB error", err));

const app = express();

const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    if (!fs.existsSync("uploads")) {
      fs.mkdirSync("uploads");
    }
    cb(null, "uploads");
  },
  filename: (_, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));

app.post(
  "/auth/login",
  loginValidation,
  handleValidationErrors,
  UserController.login
);
app.post(
  "/auth/register",
  registerValidation,
  handleValidationErrors,
  UserController.register
);
app.get("/auth/me", checkAuth, UserController.getMe);

app.patch("/auth/edit/user/:id", async (req, res) => {
  try {
    console.log(req.params.id);
    if(req.body.fullName || req.body.email || req.body.avatarUrl){
      const user = await UserModel.findByIdAndUpdate(
          req.params.id,
          {
            fullName:req.body.fullName,
            email:req.body.email,
            avatarUrl:req.body.avatarUrl
          },
          { new: true }
      );
      res.status(200).json({
        data: user
      })
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: err
    });
  }
});

app.post("/upload", upload.single("image"), (req, res) => {
  res.json({
    url: `/uploads/${req.file.originalname}`,
  });
});

app.get("/tags", PostController.getLastTags);

app.get("/posts", PostController.getAll);
app.get("/posts/tags", PostController.getLastTags);
app.get("/posts/:id", PostController.getOne);
app.post(
  "/posts",
  checkAuth,
  postCreateValidation,
  handleValidationErrors,
  PostController.create
);
app.delete("/posts/:id", checkAuth, PostController.remove);
app.patch(
  "/posts/:id",
  checkAuth,
  postCreateValidation,
  handleValidationErrors,
  PostController.update
);

// Создание комментария
app.post("/posts/:postId/comments", checkAuth, PostController.createComment);

// Получение комментариев для определенного поста
app.get("/posts/:postId/comments", PostController.getCommentsForPost);

// Удаление комментария
app.delete(
  "/posts/:postId/comments/:commentId",
  checkAuth,
  PostController.deleteComment
);

app.get("/comments/last", checkAuth, PostController.getLastComments);

app.listen(process.env.PORT || 4444, (err) => {
  if (err) {
    return console.log(err);
  }

  console.log("Server OK", 4444);
});
