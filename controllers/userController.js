import { User } from "../models/User.js";
import { Post } from "../models/Post.js";
import { Follow } from "../models/Follow.js";

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
        response.render("home-guest", {regErrors: request.flash("regErrors")});
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

export function ifUserExists(request, response, next) {
    User.findByUsername(request.params.username).then(function (userDocument) {
        request.profileUser = userDocument
        next();
    }).catch(function (e) {
        response.render("404")
    });
}

export function profilePostScreen(request, response) {
    // Getting post from user
    Post.findByAuthorId(request.profileUser._id).then(function (posts) {
        response.render("profile", {
            posts: posts,
            profileUsername: request.profileUser.username,
            profileAvatar: request.profileUser.avatar,
            isFollowing: request.isFollowing,
            isVisitorsProfile: request.isVisitorsProfile
        });
    }).catch(function () {
        response.render("404");
    });
}

export async function sharedProfileData(request, response, next) {
    let isFollowing = false;
    let isVisitorProfile = false;
    if (request.session.user) {
        isVisitorProfile = request.profileUser._id.equals(request.session.user._id);
        isFollowing = await Follow.isVisitorFollowing(request.profileUser._id, request.visitorId);
    }
    request.isVisitorsProfile = isVisitorProfile;
    request.isFollowing = isFollowing;
    next();
}