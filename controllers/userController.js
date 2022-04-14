import {User} from "../models/User.js";

let login = function (request, response) {
    let user = new User(request.body);
    user.login().then(function () {
        request.session.user = {username: user.data.username, avatar: user.avatar};
        request.session.save(function () {
            response.redirect("/");
        });
    }).catch(function (e) {
        request.flash("errors", e);
        request.session.save(function () {
            response.redirect("/");
        });
    });
};

let logout = function (request, response) {
    request.session.destroy(function () {
        response.redirect("/");
    });
};

let register = function (request, response) {
    let user = new User(request.body);
    user.register().then(() => {
        request.session.user = {username: user.data.username, avatar: user.avatar};
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
};

let home = function (request, response) {
    if(request.session.user) {
        response.render("home-dashboard", {username: request.session.user.username, avatar: request.session.user.avatar});
    }else{
        response.render("home-guest", {errors: request.flash("errors"), regErrors: request.flash("regErrors")});
    }
};

export { login, logout, register, home };