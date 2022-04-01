import {User} from "../models/User.js";
// const User = require("../models/User");

let login = function () {
    
};

let logout = function () {
    
};

let register = function (request, response) {
    let user = new User(request.body);
    console.log(user);
};

let home = function (request, response) {
    response.render("home-guest");
};

export { login, logout, register, home };