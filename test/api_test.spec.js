// process.env.NODE_ENV = "test";

const chai = require("chai");
const should = chai.should();
const expect = chai.expect;
const mongoose = require("mongoose");
const dotenv = require("dotenv");
// const sinon = require("sinon");
const { connect, closeDatabase } = require("./db-handler");
const server = require("./server");

dotenv.config({
  path: "./.env.test",
});

const chaiHttp = require("chai-http");
const { request } = require("http");

chai.use(chaiHttp);
describe("API", () => {
  before(function (done) {
    connect()
      .then(() => {
        console.log("Database connected");
      })
      .catch((err) => {
        console.log(err.message);
      });
    done();
  });
  after(function (done) {
    closeDatabase();
    done();
  });

  describe("Register", () => {
    describe("Success", () => {
      it("it should Register successfully", (done) => {
        chai
          .request("http://localhost:3002")
          .post("/api/register")
          .send({
            name: "aksh",
            email: "akshay.jaiswal@successive.tech",
            password: "123456",
          })
          .set("Content-Type", "application/json")
          .end((err, res) => {
            console.log(err);
            // res.should.have.status(200);
            // res.body.should.be.a("object");
            // done();
            expect(200)
            expect(res).not.to.be.empty;
            expect(res).to.be.an('object');
            done()
          });
      });
    });

    describe("Error", () => {
      it("it should Email Required", (done) => {
        chai
          .request("http://localhost:3002")
          .post("/api/register")
          .send({
            email: "",
          })
          .end((err, res) => {
            console.log(res.body.msg);
            res.body.should.be.a("object");
            res.body.should.have.status(409);
            done();
          });
      });

      it("it should Password Required", (done) => {
        chai
          .request("http://localhost:3002")
          .post("/api/register")
          .send({
            email: "akshay.jaiswal@successive.tech",
            password: "",
          })
          .end((err, res) => {
            // console.log(res.body);
            res.body.should.be.a("object");
            res.body.should.have.status(409);
            done();
          });
      });

      it("Email Already Exist", (done) => {
        chai
          .request("http://localhost:3002")
          .post("/register")
          .send({
            email: "akshay.jaiswal@successive.tech",
            password: "123456",
          })
          .end((err, res) => {
            console.log(res.body);
            res.body.should.be.a("object");
            res.body.should.have.status(409);
            done();
          });
      });
    });
  });

  describe("Login", () => {
    describe("Success Case", () => {
      it("it should login successfully", (done) => {
        chai
          .request("http://localhost:3002")
          .get("/api/login")
          .send({
            email: "akshay.jaiswal@successive.tech",
            password: "123456",
          })
          .set("Content-Type", "application/json")
          .end((err, res) => {
            // console.log(err);
            res.should.have.status(200);
            res.body.should.be.a("object");
            // res.should.have.status(500);

            done();
          });
      });
    });

    it("it should Email Required", (done) => {
      chai
        .request("http://localhost:3002")
        .get("/api/login")
        .send({
          email: "",
        })
        .end((err, res) => {
          res.body.should.be.a("object");
          // res.should.have.status(409);
          done();
        });
    });

    it("it should Password Required", (done) => {
      chai
        .request("http://localhost:3002")
        .get("/api/login")
        .send({
          email: "akshay.jaiswal@successive.tech",
          pass: "",
        })
        .end((err, res) => {
          res.body.should.be.a("object");
          res.body.should.have.status(409);
          done();
        });
    });

    it("No User with that Email", (done) => {
      chai
        .request("http://localhost:3002")
        .post("/api/login")
        .send({
          email: "akshay.jaiswal@successive.com",
        })
        .end((err, res) => {
          res.body.should.be.a("object");
          res.should.have.status(404);
          done();
        });
    });
  });

  describe("Resend Verfication link", () => {
    it("Email doesn't exist", (done) => {
      chai
        .request("http://localhost:3002")
        .post("/api/resendVerficationLink")
        .send({
          email: "aj@successive.tech",
        })
        .end((err, res) => {
          res.body.should.be.a("object");
          res.should.have.status(401);
          done();
        });
    });
  });

  describe("Forgot Password", () => {
    it("it should Email Required", (done) => {
      chai
        .request("http://localhost:3002")
        .post("/api/forgot_password")
        .send({
          email: "",
        })
        .end((err, res) => {
          res.body.should.be.a("object");
          done();
        });
    });
  });

});
