import { ObjectId } from "mongodb";
import { dbModule } from "../mongo.js";
import { User } from "./User.js";

export class Follow{
    constructor(followedUsername, authorId){
        this.followedUsername = followedUsername;
        this.authorId = authorId;
        this.errors = [];
        this.followsCollection = dbModule.getDb().collection("follows");
    }

    create(){
        return new Promise(async (resolve, reject) => {
            this.cleanUp();
            await this.validate("create");
            if (!this.errors.length) {
                await this.followsCollection.insertOne({followedId: this.followedId, authorId: new ObjectId(this.authorId)});
                resolve();
            } else {
                reject(this.errors);
            }
        });
    }

    delete(){
        return new Promise(async (resolve, reject) => {
            this.cleanUp();
            await this.validate("delete");
            if (!this.errors.length) {
                await this.followsCollection.deleteOne({followedId: this.followedId, authorId: new ObjectId(this.authorId)});
                resolve();
            } else {
                reject(this.errors);
            }
        });
    }

    cleanUp(){
        if(typeof(this.followedUsername) != "string"){
            this.followedUsername = "";
        }
    }

    async validate(action){
        // followedUsername must exists in database
        let followedAccount = await dbModule.getDb().collection("users").findOne({username: this.followedUsername});
        if (followedAccount) {
            this.followedId = followedAccount._id;
        } else {
            this.errors.push("You cannot follow a user that do not exists");
        }
        let doesFollowExists = await this.followsCollection.findOne({followedId: this.followedId, authorId: new ObjectId(this.authorId)});
        if (action == "create") {
            if (doesFollowExists) {
                this.errors.push("You are already following this user.");
            }
        }
        if (action == "delete") {
            if (!doesFollowExists) {
                this.errors.push("You are not following this user.");
            }
        }
        // You cant follow yourself
        if (this.followedId == this.authorId) {
            this.errors.push("You cannot follow yourself");
        }
    }

    static async isVisitorFollowing(followedId, visitorId){
        let followDoc = await dbModule.getDb().collection("follows").findOne({followedId: followedId, authorId: new ObjectId(visitorId)});
        if (followDoc) {
            return true;
        } else {
            return false;
        }
    }

    static async getFollowersById(id){
        return new Promise(async (resolve, reject) => {
            try {
                let followers = await dbModule.getDb().collection("follows").aggregate([
                    {$match: {followedId: id}},
                    {$lookup: {from: "users", localField: "authorId", foreignField: "_id", as: "userDoc"}},
                    {$project: {
                        username: {$arrayElemAt: ["$userDoc.username", 0]},
                        email: {$arrayElemAt: ["$userDoc.email", 0]},
                    }}
                ]).toArray();
                followers = followers.map(function (follower) {
                    // Create a user
                    let user = new User(follower, true);
                    return {username: follower.username, avatar: user.avatar};
                });
                resolve(followers);
            } catch (error) {
                reject();
            }
        });
    }
}