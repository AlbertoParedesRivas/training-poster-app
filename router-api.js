import express from "express";
import * as userController from "./controllers/userController.js";
import * as postController from "./controllers/postController.js";
import * as followController from "./controllers/followController.js";
import cors from "cors";

export const apiRouter = express.Router();
apiRouter.use(cors());

apiRouter.post("/login", userController.apiLogin);
apiRouter.post("/create-post", userController.apiMustBeLoggedIn, postController.apiCreatePost);
apiRouter.delete("/post/:id", userController.apiMustBeLoggedIn, postController.apiDeletePost);
apiRouter.get("/postsByAuthor/:username", userController.apiGetPostsByUsername);