const { default: mongoose } = require("mongoose");
const { uploadOnCloudinary } = require("../Utility/cloudinary");
const Property = require("../models/property");
const jwt = require("jsonwebtoken");
const createProperty = async (req, res) => {
  console.log(req.body);
  console.log("this is first log in controller ", req.files);
  let imageUrlArray = [];

  let uploadPromises = req.files.map((e) => {
    return uploadOnCloudinary(e.path) // Explicitly return the promise here
      .then((url) => {
        imageUrlArray.push(url);
      })
      .catch((error) => {
        console.error("Error uploading file:", error);
      });
  });

  Promise.all(uploadPromises)
    .then(async () => {
      console.log(req.body);
      // Move the code to extract title and create property inside the Promise.all().then() block
      try {
        const title = req.body.title;
        const description = req.body.description;
        const type = req.body.type;
        const rent = req.body.rent;
        const advance = req.body.advance;
        const bachelor = req.body.bachelor;
        const state = "Malir";
        const city = "karachi";
        const area = "Defence";
        const address = req.body.address;

        const assest = imageUrlArray; // Use the updated array of image URLs
        const bedroom = req.body.bedroom;
        const bathroom = req.body.bathroom;
        const areaofhouse = req.body.areaofhouse;
        const peoplesharing = req.body.peoplesharing;
        const propertyowner = req.body.propertyOwner;

        const myData = new Property({
          title: title,
          description: description,
          type: type,
          rent: rent,
          advance: advance,
          bachelor: bachelor,
          state: state,
          city: city,
          area: area,
          address: address,
          assest: assest,
          bedroom: bedroom,
          bathroom: bathroom,
          areaofhouse: areaofhouse,
          peoplesharing: peoplesharing,
          propertyowner: propertyowner,
        });

        // Save the new property to the database
        const savedProperty = await myData.save();

        res.status(201).json({
          success: true,
          property: savedProperty,
        });
      } catch (error) {
        console.error("Error creating Property:", error);
        res.status(500).json({
          success: false,
          error: "Internal Server Error",
        });
      }
    })
    .catch((error) => {
      console.error("Error uploading files:", error);
      res.status(500).json({
        success: false,
        error: "Error uploading files",
      });
    });
};

const myProperty = async (req, res) => {
  try {
    // Validate input
    if (!req.body.propertyowner) {
      return res.status(400).json({ error: "Property owner is required" });
    }
    console.log(req.body.propertyowner);
    // Fetch data from the database
    const myData = await Property.find(
      { propertyowner: req.body.propertyowner },
      "_id title description type rent advance bachelor state city area address assest bedroom bathroom areaofhouse propertyowner propertySelling"
    ).exec();

    // Check if any data was found
    if (myData.length === 0) {
      return res.status(200).json(myData);
    }

    // Send response
    res.status(200).json(myData);
  } catch (error) {
    // Log the error and send a server error response
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const MyAgreement = async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader.split(" ")[1];
  console.log(token);
  const verify = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  const _id = verify.response._id;
  try {
    // Validate input
    console.log(_id);
    // Fetch data from the database
    const myData = await Property.find(
      { "propertySelling.agreementMaker": _id }, // Corrected the property path
      "_id title description type rent advance bachelor state city area address assest bedroom bathroom areaofhouse propertyowner propertySelling"
    ).exec();

    // Check if any data was found
    if (myData.length === 0) {
      return res.status(200).json(myData);
    }

    // Send response
    res.status(200).json(myData);
  } catch (error) {
    // Log the error and send a server error response
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const freshRecommendation = async (req, res) => {
  try {
    // Validate input
    if (!req.body.propertyowner) {
      return res.status(400).json({ error: "Property owner is required" });
    }

    // Fetch data from the database
    const myData = await Property.find(
      {
        $and: [
          { propertyowner: { $ne: req.body.propertyowner } }, // Property owner not equal
          { "propertySelling.agreement": { $ne: true } }, // Agreement maker not equal
        ],
      }, // Use $ne for not equal
      "_id title description type rent advance bachelor state city area address assest bedroom bathroom areaofhouse propertyowner propertySelling"
    ).exec();

    // Check if any data was found
    if (myData.length === 0) {
      return res.status(404).json(myData);
    }

    // Send response
    res.status(200).json(myData);
  } catch (error) {
    // Log the error and send a server error response
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const buyerDetail = async (req, res) => {
  try {
    // Validate input
    const authHeader = req.headers.authorization;
    const token = authHeader.split(" ")[1];
    console.log(token);
    const verify = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const _id = verify.response._id;

    // Fetch data from the database
    const myData = await Property.find(
      {
        $and: [
          { propertyowner: _id }, // Property owner not equal
          { "propertySelling.agreement": true }, // Agreement maker not equal
        ],
      }, // Use $ne for not equal
      "_id title description type rent advance bachelor state city area address assest bedroom bathroom areaofhouse propertyowner propertySelling"
    )
      .populate("propertySelling.agreementMaker")
      .exec();

    // Check if any data was found
    if (myData.length === 0) {
      return res.status(200).json(myData);
    }

    // Send response
    res.status(200).json(myData);
  } catch (error) {
    // Log the error and send a server error response
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const makeAgreement = async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader.split(" ")[1];
  console.log(token);
  const verify = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  const _id = verify.response._id;

  try {
    const updatedProperty = await Property.findByIdAndUpdate(
      req.body.propertyId,
      {
        $set: {
          "propertySelling.agreement": true,
          "propertySelling.agreementMaker": new mongoose.Types.ObjectId(_id),
        },
      },
      { new: true, runValidators: true } // Return the updated document and run validators
    );

    if (!updatedProperty) {
      return res
        .status(502)
        .json({ error: "operation not perform , property not updated" });
    }

    res.status(200).json(updatedProperty);
  } catch (error) {
    console.error("Error updating property:", error);
  }
};

// const myProperty = async (req, res) => {
//   try {
//     const myData = await Property.find(
//       {},
//       "_id title description type rent advance bachelor state city area address assest bedroom bathroom areaofhouse"
//     ).exec();
//     res.json(myData);
//   } catch (error) {
//     console.log(error);
//   }
// };

module.exports = {
  createProperty,
  myProperty,
  freshRecommendation,
  makeAgreement,
  MyAgreement,
  buyerDetail,
};
