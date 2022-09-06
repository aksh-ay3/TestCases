const express = require("express");

const router = express.Router();
const userroutes = require("./controllers/routes");

router.use('/user',userroutes);

module.exports = router;