import express from "express";
import { dbModule } from "./db.js";
import {router} from "./router.js";

export const app = express();

async function start() {
    await dbModule.connect();
    // Configuring request object to include user submited data
    app.use(express.urlencoded({extended: false}));
    app.use(express.json());
    
    app.use(express.static("public"));
    app.set("views", "views");
    app.set("view engine", "ejs");
    // Setting up router
    app.use("/", router);
    app.listen(3000);
}
start();