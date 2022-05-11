import express from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import flash from "connect-flash";
import sanitizeHtml from "sanitize-html";
import { dbModule } from "./mongo.js";
import { router } from "./router.js";
import { marked } from "marked";
import { Server } from "socket.io";
import * as http from "http";
import csrf from "csurf";
import { apiRouter } from "./router-api.js";

export const app = express();
// Configuring request object to include user submited data
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use("/api", apiRouter);

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
    
    app.use(flash());
    app.use(sessionOptions);
    app.use(express.static("public"));
    app.set("views", "views");
    app.set("view engine", "ejs");
    // Including the data of the user in the session into the views
    app.use(function (request, response, next) {
        // Make markdown function available
        response.locals.filterUserHTML = function (content) {
            return sanitizeHtml(marked.parse(content), {allowedTags: ['p', 'br', 'ul', 'ol', 'li', 'strong', 'bold', 'i', 'em', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'], allowedAttributes: {}});
        }
        if(request.session.user){
            request.visitorId = request.session.user._id;
        }else{
            request.visitorId = 0;
        }
        response.locals.user = request.session.user;
        // Make error and success flash message available
        response.locals.errors = request.flash("errors");
        response.locals.success = request.flash("success");
        next();
    });
    // Setting up csurf
    app.use(csrf());
    app.use(function (request, response, next) {
        response.locals.csrfToken = request.csrfToken();
        next();
    });
    // Setting up router
    app.use("/", router);

    app.use(function (err, request, response, next) {
        if (err.code == "EBADCSRFTOKEN") {
            request.flash("errors", "Cross-site request forgery detected");
            request.session.save(() => response.redirect("/"));
        } else {
            response.render("404");
        }
    })
    // Setting up socket.io
    const server = http.createServer(app);
    const io = new Server(server);

    io.use(function (socket, next) {
        sessionOptions(socket.request, socket.request.res, next);
    });

    io.on("connection", function (socket) {
        if (socket.request.session.user) {
            let user = socket.request.session.user;
            socket.emit("welcome", {username: user.username, avatar: user.avatar});
            socket.on("chatMessageFromBrowser", function (data) {
                socket.broadcast.emit("chatMessageFromServer", {message: sanitizeHtml(data.message, {allowedTags: [], allowedAttributes: {}}), username: user.username, avatar: user.avatar});
            })
        }
    });
    server.listen(process.env.PORT);
}
start();