import express from "express";
import connectDB from "./config/dbConnect.js";
import recipeRouter from "./routes/recipeRouter.js";
import userRouter from "./routes/userRouter.js";
import guestRouter from "./routes/guestRouter.js";
import journalRouter from "./routes/journalRouter.js";
import cookieParser from "cookie-parser";
import cors from "cors";

connectDB();

const PORT = process.env.PORT;

const app = express();

const allowedOrigins = [
  "https://lecker-lex-v2.vercel.app",
  "http://localhost:5173", // For local development
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());

app.use("/search", recipeRouter);
app.use("/users", userRouter);
app.use("/journal", journalRouter);
app.use("/guests", guestRouter);

// catch-all handler for undefined routes
app.use((req, res, next) => {
  res.status(404).json({ msg: "Endpoint not found" });
});

// General error handler for unexpected errors
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ msg: error.message || "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Server is listening on port: ${PORT}`);
});
