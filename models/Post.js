import { dbModule } from "../mongo.js";
import { ObjectId } from "mongodb";
import { User } from "./User.js";

export class Post{
    constructor(data, userId){
        this.data = data;
        this.userId = userId;
        this.errors = [];
        this.postCollection = dbModule.getDb().collection("posts");
        this.cleanUp();
        this.validate();
    }

    create(){
        return new Promise((resolve, reject) => {
            if (!this.errors.length) {
                this.postCollection.insertOne(this.data).then(() => {
                    resolve();
                }).catch(()=>{
                    this.errors.push("Please try again later");
                    reject(this.errors);
                });
            } else {
                reject(this.errors);
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
            title: this.data.title.trim(),
            body: this.data.body.trim(),
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

    static postQuery(uniqueOperations){
        return new Promise(async function (resolve, reject) {
            let aggregateOperations = uniqueOperations.concat([
                {$lookup: {from: "users", localField: "author", foreignField: "_id", as: "authorDocument"}},
                {$project: {
                    title: 1,
                    body: 1,
                    createdDate: 1,
                    author: {$arrayElemAt: ["$authorDocument", 0]}
                }}
            ]);
            let posts = await dbModule.getDb().collection("posts").aggregate(aggregateOperations).toArray();
            // clean up author property in each poster
            posts = posts.map(function (post) {
                post.author = {
                    username: post.author.username,
                    avatar: new User(post.author, true).avatar
                }
                return post;
            });
            resolve(posts);
        });
    }


    static findPostById(id){
        return new Promise(async function (resolve, reject) {
            if(typeof(id) != "string" || !ObjectId.isValid(id)) {
                reject();
                return
            }
            
            let posts = await Post.postQuery([
                {$match: {_id: new ObjectId(id)}}
            ]);

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