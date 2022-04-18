import {Post} from "../models/Post.js";

export function viewCreateScreen(request, response) {
    response.render("create-post");
}

export function create(request, response) {
    let post = new Post(request.body, request.session.user._id);
    post.create().then(function () {
        response.send("Post created");
    }).catch(function (errors) {
        response.send(errors);
    });
}

export async function viewSingle(request, response) {
    try {
        let post = await Post.findPostById(request.params.id);
        response.render("single-post-screen", {post: post});
    } catch (error) {
        response.render("404");
    }
}