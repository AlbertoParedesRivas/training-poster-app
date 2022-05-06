import { Follow } from "../models/Follow.js";

export function addFollow(request, response) {
    let follow = new Follow(request.params.username, request.visitorId);
    follow.create().then(() => {
        request.flash("success", `Successfully followed ${request.params.username}`);
        request.session.save(() => response.redirect(`/profile/${request.params.username}`));
    }).catch(errors => {
        errors.forEach(error => {
            request.flash("errors", error);
        });
        request.session.save(() => response.redirect("/"));
    });
}

export function removeFollow(request, response) {
    let follow = new Follow(request.params.username, request.visitorId);
    follow.delete().then(() => {
        request.flash("success", `Successfully stopped following ${request.params.username}`);
        request.session.save(() => response.redirect(`/profile/${request.params.username}`));
    }).catch(errors => {
        errors.forEach(error => {
            request.flash("errors", error);
        });
        request.session.save(() => response.redirect("/"));
    });
}