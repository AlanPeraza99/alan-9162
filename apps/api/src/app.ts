import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env.js";
import { notFoundHandler } from "./middlewares/not-found.middleware.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import docsRouter from "./routes/docs.routes.js";

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.FRONTEND_ORIGIN }));
app.use(express.json({ limit: "100kb" }));

app.get("/api/", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/docs", docsRouter);
app.use(notFoundHandler);
app.use(errorHandler);
