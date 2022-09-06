const express = require("express");
const router = require("../Server");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const port = process.env.TEST;

dotenv.config();

const app = express();
const server = require("http").createServer(app);
server.listen(port, () => {
  console.log(`Connection success at ${port}`);
});
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/api", router);

module.exports = server;
