import { CustomForm } from "~/components/form/CustomForm";
import { useAuth } from "~/hooks/useAuth";
import { useSnailPay } from "~/hooks/usePayment";
import { paymentSchema } from "~/schemas/payment/payment.schema";
import {
  PAYMENT_FIELDS,
  PAYMENT_INITIAL_VALUES,
} from "~/constants/payment/payment.constants";
import type { PaymentFormValues } from "~/interfaces/payment/payment.interface";

interface PaymentFormProps {
  onSubmit?: () => void;
}

export const PaymentForm = ({ onSubmit }: PaymentFormProps) => {
  const { user } = useAuth();
  const { processPayment, isLoading, payment } = useSnailPay();

  const initialValues: PaymentFormValues = {
    ...PAYMENT_INITIAL_VALUES,
    fullName: user?.fullName ?? "",
  };

  const handleSubmit = async (values: PaymentFormValues): Promise<void> => {
    onSubmit?.();
    await processPayment(values);
  };

  return (
    <section
      aria-labelledby="payment-title"
      className="rounded-3xl border border-orange-200 bg-orange-50/40 p-6 sm:p-8"
    >
      <h2
        id="payment-title"
        className="text-2xl font-black tracking-tight italic"
      >
        CARGAR SALDO
      </h2>

      <p className="mt-2 text-sm text-stone-600">
        SnailPay es una simulación. Utiliza únicamente los datos ficticios de
        prueba.
      </p>

      <details className="mt-4 rounded-xl border border-orange-200 bg-white p-4">
        <summary className="cursor-pointer text-sm font-semibold text-orange-700">
          Ver tarjetas de prueba
        </summary>

        <ul className="mt-3 space-y-2 text-sm text-stone-600">
          <li>
            Aprobada: <strong>1234123412341234</strong>.
          </li>
          <li>
            Rechazada: <strong>4000000000000002</strong>.
          </li>
          <li>
            Fallo del sistema: <strong>5000000000000000</strong>.
          </li>
        </ul>

        <p className="mt-3 text-sm text-stone-600">
          Usa vencimiento <strong>12/26</strong> y CVV <strong>543</strong>.
        </p>
      </details>

      <div className="mt-6">
        <CustomForm<PaymentFormValues>
          initialValues={initialValues}
          fields={PAYMENT_FIELDS}
          validationSchema={paymentSchema}
          disabled={isLoading}
          onSubmit={handleSubmit}
          button={
            <button
              type="submit"
              className="min-w-48 rounded-xl bg-orange-600 px-6 py-3 font-bold text-white transition-colors hover:bg-orange-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? "Procesando..." : "Cargar saldo"}
            </button>
          }
        />
      </div>

      {payment && (
        <div
          role="status"
          className={`mt-6 rounded-2xl border p-4 ${
            payment.status === "approved"
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          <p className="text-sm font-semibold">{payment.message}</p>

          <p className="mt-2 break-all text-xs">
            Referencia: {payment.reference}
          </p>
        </div>
      )}
    </section>
  );
};
