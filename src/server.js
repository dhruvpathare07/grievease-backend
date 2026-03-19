require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const protectedRoutes = require("./routes/protectedRoutes");
const complaintRoutes = require("./routes/complaintRoutes");

const app = express();

// connect DB
connectDB();

// middleware
const allowedOrigins = [
  "http://localhost:5000",
  "http://localhost:5173",
  "https://admirable-croissant-4690b1.netlify.app"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  }
}));
app.use(express.json());

// routes
app.use("/api/auth", authRoutes);
app.use("/api/protected", protectedRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/uploads", express.static("uploads"));

// test route
app.get("/", (req, res) => {
  res.send("GrievEase Backend is Running 🚀");
});

// start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});