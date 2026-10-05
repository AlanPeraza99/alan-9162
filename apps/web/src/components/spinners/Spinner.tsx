interface SpinnerProps {
  message?: string;
}

export const Spinner = ({ message = "Cargando..." }: SpinnerProps) => {
  return (
    <div
      role="status"
      className="flex flex-col items-center justify-center gap-3"
    >
      <span
        aria-hidden="true"
        className="h-8 w-8 animate-spin rounded-full border-4 border-orange-100 border-t-orange-600 motion-reduce:animate-none"
      />

      <span className="text-sm text-stone-600">{message}</span>
    </div>
  );
};
