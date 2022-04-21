import {Post} from "../models/Post.js";

export function viewCreateScreen(request, response) {
    response.render("create-post");
}

export function create(request, response) {
    let post = new Post(request.body, request.session.user._id);
    post.create().then(function (insertedId) {
        request.flash("success", "New post successfully created.");
        request.session.save(() => response.redirect(`/post/${insertedId}`));
    }).catch(function (errors) {
        errors.forEach(error => request.flash("errors", error));
        request.session.save(() => response.redirect("/create-post"));
    });
}

export async function viewSingle(request, response) {
    try {
        let post = await Post.findPostById(request.params.id, request.visitorId);
        response.render("single-post-screen", {post: post});
    } catch (error) {
        response.render("404");
    }
}

export async function viewEditScreen(request, response) {
    try {
        let post = await Post.findPostById(request.params.id);
        if (post.authorId == request.visitorId) {
            response.render("edit-post", {post: post});
        } else {
            request.flash("errors", "You dont have permission to perfom that action.");
            request.session.save(() => response.redirect("/"));
        }
    } catch (error) {
        response.render("404");
    }
}

export function edit(request, response) {
    let post = new Post(request.body, request.visitorId, request.params.id);
    post.update().then((status) => {
        if (status == "success"){
            request.flash("success", "Post successfully updated.");
            request.session.save(function () {
                response.redirect(`/post/${request.params.id}/edit`)
            })
        }else{
            post.errors.forEach(function (error) {
                request.flash("errors",error);
            });
            request.session.save(function () {
                response.redirect(`/post/${request.params.id}/edit`);
            });
        }
    }).catch(() => {
        request.flash("errors", "You dont have permission to perform that action.");
        request.session.save(function () {
            response.redirect("/");
        });
    });
}