import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { api } from "~/services/api";
import { useAuth } from "~/hooks/useAuth";
import { PAYMENT_STORAGE_KEY } from "~/constants/payment/payment.constants";
import type {
  PaymentFormValues,
  PaymentRequest,
  PaymentResponse,
} from "~/interfaces/payment/payment.interface";

export const useSnailPay = () => {
  const { user, updateUser } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [payment, setPayment] = useState<PaymentResponse | null>(null);

  const savePayment = (payment: PaymentResponse): boolean => {
    setPayment(payment);

    try {
      localStorage.setItem(PAYMENT_STORAGE_KEY, JSON.stringify(payment));

      return true;
    } catch {
      toast.error("No se pudo guardar el resultado del pago.");
      return false;
    }
  };

  const processPayment = async (values: PaymentFormValues): Promise<void> => {
    if (!user) return;

    setIsLoading(true);
    setPayment(null);

    try {
      const payload: PaymentRequest = {
        cardNumber: values.cardNumber.trim(),
        expirationDate: values.expirationDate.trim(),
        cvv: values.cvv.trim(),
        fullName: values.fullName.trim(),
        amount: Number(values.amount),
        payerId: user.id,
        payerEmail: user.email,
      };

      const { data } = await api.post<PaymentResponse>(
        "/snailpay/payments",
        payload,
      );

      if (!savePayment(data)) return;

      if (data.status !== "approved") {
        toast.error(data.message);
        return;
      }

      // Sumamos en centavos para evitar errores como 0.1 + 0.2.
      const balanceInCents = Math.round(user.balance * 100);
      const paymentInCents = Math.round(data.transaction_amount * 100);
      const newBalanceInCents = balanceInCents + paymentInCents;

      if (!Number.isSafeInteger(newBalanceInCents)) {
        toast.error("El saldo resultante supera el límite permitido.");
        return;
      }

      const saved = updateUser({
        ...user,
        balance: newBalanceInCents / 100,
      });

      if (!saved) return;

      toast.success(data.message);
    } catch (error: unknown) {
      if (axios.isAxiosError<PaymentResponse>(error)) {
        const response = error.response?.data;

        if (response?.status === "error") {
          savePayment(response);
        }
      }

      // El interceptor ya muestra los errores HTTP y de conexión.
    } finally {
      setIsLoading(false);
    }
  };

  return { processPayment, isLoading, payment };
};
