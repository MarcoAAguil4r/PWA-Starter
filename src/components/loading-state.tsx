interface LoadingStateProps {
  label?: string;
}

export function LoadingState({ label = "Cargando inspecciones..." }: LoadingStateProps) {
  return (
    <p role="status" aria-live="polite">
      {label}
    </p>
  );
}