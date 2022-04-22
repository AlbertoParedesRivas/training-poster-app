import { dbModule } from "../mongo.js";
import { ObjectId } from "mongodb";
import { User } from "./User.js";
import sanitizeHtml from "sanitize-html";

export class Post{
    constructor(data, userId, requestedPostId){
        this.data = data;
        this.userId = userId;
        this.requestedPostId = requestedPostId;
        this.errors = [];
        this.postCollection = dbModule.getDb().collection("posts");
        this.cleanUp();
        this.validate();
    }

    create(){
        return new Promise((resolve, reject) => {
            if (!this.errors.length) {
                this.postCollection.insertOne(this.data).then((info) => {
                    resolve(info.insertedId);
                }).catch(()=>{
                    this.errors.push("Please try again later");
                    reject(this.errors);
                });
            } else {
                reject(this.errors);
            }
        });
    }

    update(){
        return new Promise(async (resolve, reject) => {
            try {
                let post = await Post.findPostById(this.requestedPostId, this.userId);
                if (post.isVisitorOwner) {
                    let status = await this.actuallyUpdate();
                    resolve(status);
                } else {
                    reject();
                }
            } catch (error) {
                reject();
            }
        });
    }

    static delete(postIdToDelete, currentUserId){
        return new Promise(async (resolve, reject) => {
            try {
                let post = await Post.findPostById(postIdToDelete, currentUserId);
                if (post.isVisitorOwner) {
                    await dbModule.getDb().collection("posts").deleteOne({_id: new ObjectId(postIdToDelete)});
                    resolve();
                }else{
                    reject();
                }
            } catch (error) {
                reject();
            }
        });
    }

    actuallyUpdate(){
        return new Promise(async (resolve, reject) => {
            if(!this.errors.length){
                await this.postCollection.findOneAndUpdate({_id: new ObjectId(this.requestedPostId)}, {$set: {title: this.data.title, body: this.data.body}});
                resolve("success");
            }else{
                resolve("failure")
            }
        });
    }
    
    cleanUp(){
        if(typeof(this.data.title) != "string"){
            this.data.title = "";
        }
        if(typeof(this.data.body) != "string"){
            this.data.body = "";
        }
        this.data = {
            title: sanitizeHtml(this.data.title.trim(), {allowedTags: [], allowedAttributes: {}}),
            body: sanitizeHtml(this.data.body.trim(), {allowedTags: [], allowedAttributes: {}}),
            createdDate: new Date(),
            author: ObjectId(this.userId)
        }
    }

    validate(){
        if(this.data.title == "")
            this.errors.push("You must provide a title");
        if(this.data.body == "")
            this.errors.push("You must provide post content");
    }

    static postQuery(uniqueOperations, visitorId){
        return new Promise(async function (resolve, reject) {
            let aggregateOperations = uniqueOperations.concat([
                {$lookup: {from: "users", localField: "author", foreignField: "_id", as: "authorDocument"}},
                {$project: {
                    title: 1,
                    body: 1,
                    createdDate: 1,
                    authorId: "$author",
                    author: {$arrayElemAt: ["$authorDocument", 0]}
                }}
            ]);
            let posts = await dbModule.getDb().collection("posts").aggregate(aggregateOperations).toArray();
            // clean up author property in each poster
            posts = posts.map(function (post) {
                post.isVisitorOwner = post.authorId.equals(visitorId);
                post.author = {
                    username: post.author.username,
                    avatar: new User(post.author, true).avatar
                }
                return post;
            });
            resolve(posts);
        });
    }


    static findPostById(id, visitorId){
        return new Promise(async function (resolve, reject) {
            if(typeof(id) != "string" || !ObjectId.isValid(id)) {
                reject();
                return
            }
            
            let posts = await Post.postQuery([
                {$match: {_id: new ObjectId(id)}}
            ], visitorId);

            if (posts.length) {
                resolve(posts[0]);
            } else {
                reject();
            }
        });
    }

    static findByAuthorId(authorId){
        return Post.postQuery([
            {$match: {author: authorId}},
            {$sort: {createdDate: -1}}
        ]);
    }
}