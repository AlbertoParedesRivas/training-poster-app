import express from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import flash from "connect-flash";
import { dbModule } from "./mongo.js";
import {router} from "./router.js";

export const app = express();

async function start() {
    await dbModule.connect();
    let sessionOptions = session({
        secret: "posting training app",
        store: MongoStore.create({client: dbModule.getClient()}),
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24,
            httpOnly: true
        }
    });
    // Configuring request object to include user submited data
    app.use(express.urlencoded({extended: false}));
    app.use(express.json());
    
    app.use(flash());
    app.use(sessionOptions);
    app.use(express.static("public"));
    app.set("views", "views");
    app.set("view engine", "ejs");
    // Setting up router
    app.use("/", router);
    app.listen(process.env.PORT);
}
start();