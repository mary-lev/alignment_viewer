// components/ui/toast.tsx
type ToastProps = {
  title: string;
  description: string;
  variant?: 'default' | 'destructive';
};

export const toast = ({ title, description, variant = 'default' }: ToastProps) => {
  console.log(`[${variant.toUpperCase()}] ${title}: ${description}`);
};