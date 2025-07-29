const express = require("express");
const app = express();
const { DBConnection } = require("./database/db");
const User = require("./models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

DBConnection();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello to index");
});

app.post("/register", async (req, res) => {
  try {
    // get all data from frontend
    const { firstName, lastName, email, password } = req.body;

    // check all the data should exists
    if (!(firstName && lastName && email && password)) {
      return res.status(400).send("Enter all details");
    }

    // check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send("User already exists with same email");
    }

    // hashing and encrypt password
    const hashedPassword = await bcrypt.hash(password, 10);

    // save user in db
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    // generate a token for user and send it
    const token = jwt.sign({ id: user._id, email }, process.env.SECRET_KEY, {
      expiresIn: "1h",
    });
    user.token = token;
    // user.password = undefined;
    res.status(200).json({ message: "User registered successfully", user });

  } catch (error) {
    console.log(error);
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server is listening on http://localhost:${process.env.PORT}`);
});
