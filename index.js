const express = require("express");
const morgan = require("morgan");
import axios from "axios";
import { rateLimit } from "express-rate-limit";
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();

const PORT = 3004;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100,
});

app.use(morgan("combined"));
app.use(limiter);

app.use("/bookingservice", async (req, res, next) => {
  console.log(req.headers["x-access-token"]);
  try {
    const response = await axios.get(
      "http://localhost:3001/api/v1/isauthenticated",
      {
        headers: {
          "x-access-token": req.headers["x-access-token"],
        },
      }
    );
    if (response.data.success) {
      next();
    } else {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
});

app.use(
  "/bookingservice",
  createProxyMiddleware({ target: "http://localhost:3002", changeOrigin: true })
);
app.get("/home", (req, res) => {
  return res.json({ message: "OK" });
});

app.listen(PORT, () => {
  console.log(`Server started at port ${PORT}`);
});
