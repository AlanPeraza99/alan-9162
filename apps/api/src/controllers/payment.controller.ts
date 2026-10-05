import type { NextFunction, Request, Response } from "express";
import type {
  PaymentRequest,
  PaymentResponse,
} from "../interfaces/payment/payment.interface.js";
import { processPayment as processPaymentService } from "../services/payment/payment.service.js";

export async function processPayment(
  req: Request<Record<string, never>, PaymentResponse, PaymentRequest>,
  res: Response<PaymentResponse>,
  next: NextFunction,
): Promise<void> {
  try {
    const payment = await processPaymentService(req.body);

    const status = payment.status === "error" ? 503 : 200;

    res.status(status).json(payment);
  } catch (error) {
    next(error);
  }
}
