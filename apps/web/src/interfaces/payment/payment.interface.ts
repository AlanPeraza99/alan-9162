export interface PaymentFormValues {
  cardNumber: string;
  expirationDate: string;
  cvv: string;
  fullName: string;
  amount: string;
}

export interface PaymentRequest {
  cardNumber: string;
  expirationDate: string;
  cvv: string;
  fullName: string;
  amount: number;
  payerId: string;
  payerEmail: string;
}

export interface PaymentResponse {
  id: string;
  status: "approved" | "rejected" | "error";
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
