const express = require("express");
const router = express.Router();

const {staffAuthentication, createStudent , studentAuthentication} = require("../controller/authentication")


router.route("/staff").post(staffAuthentication);
router.route("/studentSignUp").post(createStudent);
router.route("/studentSignIn").post(studentAuthentication);

module.exports = router;