type ToastArgs = { title: string; description: string; variant?: string };
export const useToast = () => ({
  toast: ({ title, description, variant }: ToastArgs) => {
    alert(`${title}: ${description}`);
  }
}); 