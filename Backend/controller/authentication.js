const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const officeHolder = require("../models/officeHolder");
const studentUser = require("../models/student");
const cors = require("cors");

require("dotenv").config();

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173", // Allow requests from this origin
    credentials: true, // Allow sending cookies
  })
);
const staffAuthentication = async (req, res) => {
  let data = req.body;
  const myData = await officeHolder
    .find(
      { name: data.name, password: data.password },
      "name position category"
    )
    .exec();
  if (myData.length !== 0) {
    const accessToken = jwt.sign(
      { response: myData },
      process.env.ACCESS_TOKEN_SECRET
    );
    res.cookie("jwt", accessToken).send(myData);
    console.log(myData);
    // Sending a response with the access token
  } else {
    res.send(myData);
    console.log(myData);
  }
};

const createStudent = async (req, res) => {
  const email = req.body.email;
  const existUsername = await studentUser.findOne({ email: email }).exec();
  res.json({ response: existUsername });
  //   if (existUsername) {
  //     rss.json()
  //   }else{

  //   try {
  //     const creatorid = req.body.creatorid;
  //     const title = req.body.title;
  //     const description = req.body.description;
  //     const category = req.body.category;

  //     const myData = new Issue({
  //       title: title,
  //       description: description,
  //       category: category,
  //       creator: creatorid,
  //     });

  //     // Save the new issue to the database
  //     const savedIssue = await myData.save();

  //     res.status(201).json({
  //       success: true,
  //       issue: savedIssue,
  //     });
  //   } catch (error) {
  //     console.error("Error creating issue:", error);
  //     res.status(500).json({
  //       success: false,
  //       error: "Internal Server Error",
  //     });
  //   }}
};

const studentAuthentication = async (req, res) => {
  let data = req.body;
  const myData = await studentUser
    .find(
      { duetId: data.duetid, Password: data.password },
      "name department status duetId Role"
    )
    .exec();
  console.log("api hit");
  if (myData.length !== 0) {
    const accessToken = jwt.sign(
      { response: myData },
      process.env.ACCESS_TOKEN_SECRET
    );
    res.cookie("jwt", accessToken).send(myData);
    console.log(myData);
    // Sending a response with the access token
  } else {
    res.send(myData);
    console.log(myData);
  }
};

module.exports = { staffAuthentication, createStudent, studentAuthentication };
