// const express = require("express");
// const app = express();
// const router = require("./router"); 
import express from "express";
import {router} from "./router.js";

const app = express();


// Configuring request object to include user submited data
app.use(express.urlencoded({extended: false}));
app.use(express.json());

app.use(express.static("public"));
app.set("views", "views");
app.set("view engine", "ejs");
// Setting up router
app.use("/", router);

app.listen(3000);