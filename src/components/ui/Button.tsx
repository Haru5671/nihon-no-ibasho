import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className = "", children, ...props }, ref) => {
    const base = "inline-flex items-center justify-center font-semibold rounded-full transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed";

    const variants = {
      primary:   "bg-primary text-on-primary hover:bg-primary/90 shadow-card",
      secondary: "bg-secondary-container text-on-secondary-container hover:bg-secondary-fixed",
      ghost:     "bg-transparent text-primary hover:bg-primary/8",
      danger:    "bg-error text-on-error hover:bg-error/90",
    };

    const sizes = {
      sm: "text-[12px] px-4 py-1.5 min-h-[36px]",
      md: "text-[13px] px-5 py-2.5 min-h-[44px]",
      lg: "text-[15px] px-7 py-3 min-h-[52px]",
    };

    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
export default Button;
