const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
const { DBConnection } = require("./database/db");
const User = require("./models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ✅ Load environment variables early
dotenv.config();

// ✅ CORS Configuration
const corsOptions = {
  origin: ["http://localhost:8080", "https://oj-project-nine.vercel.app"], // local + deployed
  credentials: true,
};

app.use(cors(corsOptions));

// ✅ Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Connect to MongoDB
DBConnection();

// ✅ Import routes
const problemRoutes = require("./routes/problemRoutes");
const userRoutes = require("./routes/userRoutes");

// ✅ Test route
app.get("/", (req, res) => {
  res.send("Hello WORLD !");
});

// ✅ Register
app.post("/register", async (req, res) => {
  try {
    const { firstname, lastname, email, password } = req.body;

    if (!(firstname && lastname && email && password)) {
      return res.status(400).send("Please enter all the information");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send("User already exists with the same email");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstname,
      lastname,
      email,
      password: hashedPassword,
    });

    const token = jwt.sign({ id: user._id, email }, process.env.SECRET_KEY, {
      expiresIn: "1h",
    });

    user.password = undefined;

    res.status(200).json({
      message: "You have successfully registered!",
      token,
      user,
    });
  } catch (error) {
    console.log("Register error:", error);
    res.status(500).send("Server error during registration");
  }
});

// ✅ Login with improved error messages
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!(email && password)) {
      return res.status(400).send("Please enter both email and password");
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).send("User not registered");  // User not found message
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).send("Invalid credentials");  // Wrong password message
    }

    const token = jwt.sign({ id: user._id, email }, process.env.SECRET_KEY, {
      expiresIn: "1h",
    });

    user.password = undefined;

    res.status(200).json({
      message: "Login successful",
      token,
      user,
    });
  } catch (error) {
    console.log("Login error:", error);
    res.status(500).send("Server error during login");
  }
});

// ✅ Logout
app.post("/logout", (req, res) => {
  res.status(200).json({
    message: "Logout successful. Please delete token from client (like localStorage).",
  });
});

// ✅ Routes
app.use("/api/problems", problemRoutes);
app.use("/api/user", userRoutes);

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
