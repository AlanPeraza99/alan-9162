export interface PaymentRequest {
  cardNumber: string;
  expirationDate: string;
  cvv: string;
  fullName: string;
  amount: number;
  payerId: string;
  payerEmail: string;
}

export type PaymentStatus = "approved" | "rejected" | "error";

export interface PaymentResponse {
  id: string;
  status: PaymentStatus;
  status_detail: string;
  transaction_amount: number;
  date_created: string;
  authorization_code: string | null;
  reference: string;
  payer_id: string;
  payer_email: string;
  card_number: string;
  cvv: string;
  message: string;
}
