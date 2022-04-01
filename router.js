// const express = require("express");
// const userController = require("./controllers/userController");
import express from "express";
import * as userController from "./controllers/userController.js";

export const router = express.Router();

router.get("/", userController.home);
router.post("/register", userController.register);