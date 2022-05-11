import { User } from "../models/User.js";
import { Post } from "../models/Post.js";
import { Follow } from "../models/Follow.js";
import jwt from "jsonwebtoken";

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

export async function home(request, response) {
    if(request.session.user) {
        let posts = await Post.getFeed(request.session.user._id);
        response.render("home-dashboard", {posts: posts});
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
            title: `Profile for ${request.profileUser.username}`,
            currentPage: "posts",
            posts: posts,
            profileUsername: request.profileUser.username,
            profileAvatar: request.profileUser.avatar,
            isFollowing: request.isFollowing,
            isVisitorsProfile: request.isVisitorsProfile,
            counts: {postCount: request.postCount,followerCount: request.followerCount,followingCount: request.followingCount}
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
    // Retrieve post follower and following count
    let postCountPromise =  Post.countPostByAuthor(request.profileUser._id);
    let followerCountPromise =  Follow.countFollowersById(request.profileUser._id);
    let followingCountPromise =  Follow.countFollowingById(request.profileUser._id);
    let [postCount, followerCount, followingCount] = await Promise.all([postCountPromise, followerCountPromise, followingCountPromise]);
    request.postCount = postCount;
    request.followerCount = followerCount;
    request.followingCount = followingCount;
    next();
}

export async function profileFollowersScreen(request, response) {
    try {
        let followers = await Follow.getFollowersById(request.profileUser._id);
        response.render("profile-followers", {
            currentPage: "followers",
            followers: followers,
            profileUsername: request.profileUser.username,
            profileAvatar: request.profileUser.avatar,
            isFollowing: request.isFollowing,
            isVisitorsProfile: request.isVisitorsProfile,
            counts: {postCount: request.postCount,followerCount: request.followerCount,followingCount: request.followingCount}
        });
    } catch (error) {
        response.render("404");
    }
}

export async function profileFollowingScreen(request, response) {
    try {
        let following = await Follow.getFollowingById(request.profileUser._id);
        response.render("profile-following", {
            currentPage: "following",
            following: following,
            profileUsername: request.profileUser.username,
            profileAvatar: request.profileUser.avatar,
            isFollowing: request.isFollowing,
            isVisitorsProfile: request.isVisitorsProfile,
            counts: {postCount: request.postCount,followerCount: request.followerCount,followingCount: request.followingCount}
        });
    } catch (error) {
        response.render("404");
    }
}

export async function doesUsernameExists(request, response){
    User.findByUsername(request.body.username).then(function() {
        response.json(true);
    }).catch(function() {
        response.json(false);
    });
}

export async function doesEmailExists(request, response){
    let emailExists = await User.doesEmailExists(request.body.email);
    response.json(emailExists);
}

export function apiLogin(request, response){
    let user = new User(request.body);
    user.login().then(function () {
        response.json(jwt.sign({_id: user.data._id}, process.env.JWTSECRET, {expiresIn: "30m"}));
    }).catch(function (e) {
        response.json("XC");
    });
}

export function apiMustBeLoggedIn(request, response, next) {
    try {
        request.apiUser = jwt.verify(request.body.token, process.env.JWTSECRET);
        next();
    } catch (error) {
        response.json("You must provide a valid token");
    }
}

export async function apiGetPostsByUsername(request, response) {
    try {
        let authorDoc = await User.findByUsername(request.params.username);
        let posts = await Post.findByAuthorId(authorDoc._id);
        response.json(posts);
    } catch (error) {
        response.json("Invalid user requested");
    }
}