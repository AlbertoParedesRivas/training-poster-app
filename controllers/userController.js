import {User} from "../models/User.js";

export function login(request, response) {
    let user = new User(request.body);
    user.login().then(function () {
        request.session.user = {_id: user.data._id, username: user.data.username, avatar: user.avatar};
        request.session.save(function () {
            response.redirect("/");
        });
    }).catch(function (e) {
        request.flash("errors", e);
        request.session.save(function () {
            response.redirect("/");
        });
    });
}

export function logout(request, response) {
    request.session.destroy(function () {
        response.redirect("/");
    });
}

export function register(request, response) {
    let user = new User(request.body);
    user.register().then(() => {
        request.session.user = {_id: user.data._id, username: user.data.username, avatar: user.avatar};
        request.session.save(function () {
            response.redirect("/");
        });
    }).catch((regErrors) => {
        regErrors.forEach(function (error) {
            request.flash("regErrors", error);
        });
        request.session.save(function () {
            response.redirect("/");
        });
    });
}

export function home(request, response) {
    if(request.session.user) {
        response.render("home-dashboard");
    }else{
        response.render("home-guest", {errors: request.flash("errors"), regErrors: request.flash("regErrors")});
    }
}

export function mustBeLoggedIn(request, response, next) {
    if (request.session.user) {
        next();
    } else {
        request.flash("errors", "You must be logged in to performe this action");
        request.session.save(function () {
            response.redirect("/");
        });
    }
}