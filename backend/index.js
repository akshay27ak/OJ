const express = require("express")
const app = express()
const cors = require("cors")
const User = require("./models/User")
const { DBConnection } = require("./database/db")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const dotenv = require("dotenv")

dotenv.config()

const corsOptions = {
  origin: ["http://localhost:8080", "https://oj-kappa.vercel.app"], 
  credentials: true,
}

app.use(cors(corsOptions))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

DBConnection()

const problemRoutes = require("./routes/problemRoutes")
const userRoutes = require("./routes/userRoutes")
const submissionRoutes = require("./routes/submissionRoutes")

app.get("/", (req, res) => {
  res.send("Hello WORLD !")
})

app.post("/register", async (req, res) => {
  try {
    const { firstname, lastname, email, password } = req.body

    if (!(firstname && lastname && email && password)) {
      return res.status(400).send("Please enter all the information")
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).send("User already exists with the same email")
    }

    const hashPass = await bcrypt.hash(password, 10)

    const user = await User.create({
      firstname,
      lastname,
      email,
      password: hashPass,
    })

    const token = jwt.sign({ id: user._id, email }, process.env.SECRET_KEY, {
      expiresIn: "1h",
    })

    user.password = undefined

    res.status(200).json({
      message: "You have successfully registered!",
      token,
      user,
    })
  } catch (error) {
    console.log("Register error:", error)
    res.status(500).send("Server error during registration")
  }
})


app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    if (!(email && password)) {
      return res.status(400).send("Please enter both email and password")
    }

    const user = await User.findOne({ email })

    if (!user) {
      return res.status(404).send("User not registered") 
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(401).send("Invalid credentials") 
    }

    const token = jwt.sign({ id: user._id, email }, process.env.SECRET_KEY, {
      expiresIn: "1h",
    })

    user.password = undefined

    res.status(200).json({
      message: "Login successful",
      token,
      user,
    })
  } catch (error) {
    console.log("Login error:", error)
    res.status(500).send("Server error during login")
  }
})

app.post("/logout", (req, res) => {
  res.status(200).json({
    message: "Logout successful. Please delete token from client (like localStorage).",
  })
})

app.use("/api/problems", problemRoutes)
app.use("/api/user", userRoutes)
app.use("/api/submissions", submissionRoutes)

const PORT = process.env.PORT || 5000
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Verdiq Backend Server is running on port ${PORT}`)
})
