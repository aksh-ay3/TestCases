module.exports = class Controller {
  register(req, res) {
    if (req.body.email && req.body.name) {
      User.findOne({ email: req.body.email })
        .then((user) => {
          if (user)
            return res.json({ status: 409, error: "email already exist" });
          else {
            if (req.body.password) {
              if (req.body.password.length > 5) {
                bcrypt.hash(req.body.password, rounds, (error, hash) => {
                  if (error) res.status(500).json(error);
                  else {
                    // console.log("req body", req.body)
                    const newUser = User({
                      name: req.body.name,
                      email: req.body.email,
                      password: hash,
                      token: "",
                      //   password: req.body.password,
                    });
                    newUser
                      .save()
                      .then((user) => {
                        res
                          .status(200)
                          .json({ user, msg: "User added successfully" });
                      })
                      .catch((error) => {
                        console.log(error);
                        res.status(500).json(error);
                      });
                  }
                });
              } else
                return res.send({
                  status: 409,
                  msg: "you have to enter at least 6 digit!",
                });
            } else
              return res.send({ status: 409, msg: "Please Enter Password" });
          }
        })
        .catch((error) => {
          console.log(error);
          res.status(500).json(error);
        });
    } else return res.send({ status: 409, msg: "Please Enter Name and Email" });
  }

  login(req, res) {
    if (req.body.email) {
      User.findOne({ email: req.body.email })
        .then((user) => {
          // console.log("user--",user)
          if (!user) res.status(500).json({ error: "no user with that email" });
          else {
            if (req.body.password) {
              bcrypt.compare(
                req.body.password,
                user.password,
                (error, match) => {
                  if (error) res.status(500).json(error);
                  else if (match)
                    res.status(200).json({
                      token: generateToken(user),
                      msg: "Login successfully",
                    });
                  else
                    return res.send({
                      status: 409,
                      error: "Password do not match",
                    });
                }
              );
            } else
              return res.send({ status: 409, error: "Please Enter Password" });
          }
        })
        .catch((error) => {
          res.status(500).json(error);
        });
    } else return res.send({ status: 409, error: "Please Enter Email" });
    // res.send(posts)
  }

  resendVerficationLink(req, res) {
    try {
      User.findOne({ email: req.body.email }).then((user) => {
        if (!user) {
          res.status(401).json({ msg: "User with this email not found" });
        }
        //creating the token to be sent to the forgot password form
        const token = generateToken(user);

        const updateToken = User.updateOne(
          { email: req.body.email },
          { $set: { token: token } }
        );
        // console.log(updateToken);

        const transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 25,
          secure: false, // upgrade later with STARTTLS
          auth: {
            user: "akshay.jaiswal@successive.tech",
            pass: "xlzoddkgwydfqwqb",
          },
        });
        const mailOptions = {
          from: "aj@gmail.com",
          to: req.body.email,
          subject: "Email verification",
          html: "<p> Hii " + token,
        };
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            throw new Error(error);
          } else {
            console.log("Mail has been send");
          }
        });
      });
    } catch (error) {
      console.log("Something went wrong: Service: login -> ", error.statusCode);
    }
  }

  async reset_password(req,res){
    try {
        if(req.body.password && req.body.confirmPassword){          
          const user = await User.findOne({token: req.query.token});          
        if(!user){
            res.send({status:401,error:"The link has been expired."})
        }
        if(req.body.password!= req.body.confirmPassword){
          res.send({status:401,error:"Password must match."})
        }
        let password= req.body.password.toString();
        // console.log(typeof password);
        
        const pass = await bcrypt.hash(password, 12);
        // console.log(user._id);
        
        const update_user = await User.findByIdAndUpdate(
          {_id : user._id},
          {
            $set:{
              password : pass,
              token : ""
            },
          },
          {
            new : true,
          }
        );
        res.send({status:200,msg:"Password change successfully."});
        }else{
          res.send({status:409,error:"Password and Confirm Password required."});
        }

    } catch (error) {
      res.status(500).json(error);
    }
  }


  async forgot_password(req,res){
  try {
    const user = await User.findOne({ email : req.body.email });
    if (!user) {
      res.send({status:409,error:"User with this email not found"});
    }
    //creating the token to be sent to the forgot password form
    const token = crypto.randomBytes(32).toString("hex");
    const updateToken = await User.updateOne(
      { _id: user._id },
      { $set: { token: token } }
    );
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // upgrade later with STARTTLS
      auth: {
        user: "akshay.jaiswal@successive.tech",
        pass: "xlzoddkgwydfqwqb",
      },
    });
    const mailOptions = {
      from: "akshay.jaiswal@succesive.tech",
      to: req.body.email,
      subject: "Reset your password",
      html:
        "<p> Hii " +
        user.name +
        ',Please click on the link and <a href="http://localhost:9000/reset_password?token=' +
        token +
        '"> and reset your password </a>',
    };
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        throw new Error(error);
      } else {
        console.log("Mail has been send");
        return res.send({status:200,msg:"Mail has been send"});

      }
    });
  } catch (error) {
    console.log("Something went wrong: Service: login -> ", error.statusCode);
    // throw new customError(error, error.statusCode);
    res.send({status:409,error:error});

  }

  }
};
