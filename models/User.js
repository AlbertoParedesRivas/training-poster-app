import validator from "validator"
import bcrypt from "bcryptjs";
import { dbModule } from "../mongo.js";
import md5 from "md5";


export class User{
    constructor(data, getAvatar){
        this.usersCollection = dbModule.getDb().collection("users");
        this.data = data;
        this.errors = [];
        if (getAvatar == undefined) {
            this.avatar = false;
        }
        if (getAvatar) {
            this.getAvatar();
        }
    }
    
    register(){
        return new Promise(async (resolve, reject) => {
            this.cleanUp();
            await this.validate();
            if(!this.errors.length){
                // hash user password
                let salt = bcrypt.genSaltSync(10);
                this.data.password = bcrypt.hashSync(this.data.password, salt);
                await this.usersCollection.insertOne(this.data);
                this.getAvatar();
                resolve();
            }else{
                reject(this.errors);
            }
        });
    }

    login(){
        return new Promise((resolve, reject) => {
            this.cleanUp();
            this.usersCollection.findOne({username: this.data.username}).then((attempedUser) => {
                if (attempedUser && bcrypt.compareSync(this.data.password, attempedUser.password)) {
                    this.data = attempedUser;
                    this.getAvatar();
                    resolve("Login success");
                } else {
                    reject("Invalid username or password");
                }
            }).catch(function (e) {
                reject("Please try again later.");
            });
        });
    }

    validate(){
        return new Promise(async (resolve, reject) => {
            if(this.data.username == ""){
                this.errors.push("You must provide an username.");
            }
            if (this.data.username != "" && !validator.isAlphanumeric(this.data.username)) {
                this.errors.push("Username can only contain letter and numbers.");
            }
            if(!validator.isEmail(this.data.email)){
                this.errors.push("You must provide an email.");
            }
            if(this.data.password == ""){
                this.errors.push("You must provide a password.");
            }
            if(this.data.password.length > 0 && this.data.password.length < 12){
                this.errors.push("Password must be at least 12 characters.");
            }
            if(this.data.password.length > 50){
                this.errors.push("Password cannot exceed 50 characters.");
            }
            if(this.data.username.length > 0 && this.data.username.length < 3){
                this.errors.push("Username must be at least 3 characters.");
            }
            if(this.data.username.length > 200){
                this.errors.push("Username cannot exceed 200 characters.");
            }
    
            //If username is valid check if the username is taken
            if (this.data.username.length > 3 && this.data.username.length < 31 && validator.isAlphanumeric(this.data.username)) {
                let usernameExist = await this.usersCollection.findOne({username: this.data.username});
                if (usernameExist) {
                    this.errors.push("Username already taken.")
                }
            }
            //If email is valid check if the email is taken
            if (validator.isEmail(this.data.email)) {
                let emailExist = await this.usersCollection.findOne({email: this.data.email});
                if (emailExist) {
                    this.errors.push("Email already registered.")
                }
            }
            resolve();
        });
    }

    cleanUp(){
        if(typeof(this.data.username) != "string"){
            this.data.username = "";
        }
        if(typeof(this.data.email) != "string"){
            this.data.email = "";
        }
        if(typeof(this.data.password) != "string"){
            this.data.password = "";
        }
        this.data = {
            username: this.data.username.trim().toLowerCase(),
            email: this.data.email.trim().toLowerCase(),
            password: this.data.password
        }
    }

    getAvatar(){
        this.avatar = `https://gravatar.com/avatar/${md5(this.data.email)}?s=128`;
    }

    static findByUsername(username){
        return new Promise(function(resolve, reject){
            if (typeof(username) != "string") {
                reject();
                return;
            }
            dbModule.getDb().collection("users").findOne({username: username}).then(function (userDocument) {
                if(userDocument){
                    userDocument = new User(userDocument, true);
                    userDocument = {
                        _id: userDocument.data._id,
                        username: userDocument.data.username,
                        avatar: userDocument.avatar
                    };
                    resolve(userDocument);
                }else{
                    reject();
                }
            }).catch(function () {
                reject();
            });
        });
    }

    static doesEmailExists(email){
        return new Promise(async function (resolve, reject) {
            if(typeof(email) != "string"){
                resolve(false);
                return;
            }

            let user = await dbModule.getDb().collection("users").findOne({email: email});
            if (user) {
                resolve(true);
            }else{
                resolve(false);
            }
        });
    }
}