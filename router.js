import express from "express";
import * as userController from "./controllers/userController.js";
import * as postController from "./controllers/postController.js";

export const router = express.Router();

// User related routes
router.get("/", userController.home);
router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/logout", userController.logout);

// Post related routes
router.get("/create-post", userController.mustBeLoggedIn, postController.viewCreateScreen);
router.post("/create-post", userController.mustBeLoggedIn, postController.create);
router.get("/post/:id", postController.viewSingle);
router.get("/post/:id/edit",userController.mustBeLoggedIn, postController.viewEditScreen);
router.post("/post/:id/edit",userController.mustBeLoggedIn, postController.edit);
router.post("/post/:id/delete",userController.mustBeLoggedIn, postController.deletePost);
router.post("/search",userController.mustBeLoggedIn, postController.search);

// Profile related routes
router.get("/profile/:username", userController.ifUserExists, userController.profilePostScreen);