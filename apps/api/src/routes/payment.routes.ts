import { Router } from "express";
import { processPayment } from "../controllers/payment.controller.js";

export const paymentRouter = Router();

paymentRouter.post("/payments", processPayment);
