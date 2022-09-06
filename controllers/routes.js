const express =  require("express");
const userroutes = express.Router();
const controller = require("./controller");
const usercontroller = new controller();

userroutes.post("/", usercontroller.register);
// userroutes.get("/",usercontroller.select);
// userroutes.put("/", usercontroller.update);
// userroutes.delete("/", usercontroller.delete);

module.exports = userroutes;
