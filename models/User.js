import validator from "validator"
import bcrypt from "bcryptjs";
import { dbModule } from "../mongo.js";


export class User{
    constructor(data){
        this.usersCollection = dbModule.getDb().collection("users");
        this.data = data;
        this.errors = [];
    }
    
    register(){
        this.cleanUp();
        this.validate();
        if(!this.errors.length){
            // hash user password
            let salt = bcrypt.genSaltSync(10);
            this.data.password = bcrypt.hashSync(this.data.password, salt);
            this.usersCollection.insertOne(this.data);
        }
    }

    login(){
        return new Promise((resolve, reject) => {
            this.cleanUp();
            this.usersCollection.findOne({username: this.data.username}).then((attempedUser) => {
                if (attempedUser && bcrypt.compareSync(this.data.password, attempedUser.password)) {
                    resolve("Login success");
                } else {
                    reject("Login fail");
                }
            }).catch(function () {
                reject("Please try again later.");
            });
        });
    }

    validate(){
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
        if(this.data.username.length > 0 && this.data.username.length < 12){
            this.errors.push("Username must be at least 12 characters.");
        }
        if(this.data.username.length > 200){
            this.errors.push("Username cannot exceed 200 characters.");
        }
    }

    cleanUp(){
        if(typeof(this.username) != "string"){
            this.username = "";
        }
        if(typeof(this.email) != "string"){
            this.email = "";
        }
        if(typeof(this.password) != "string"){
            this.password = "";
        }
        this.data = {
            username: this.data.username,
            email: this.data.email,
            password: this.data.password
        }
    }
}