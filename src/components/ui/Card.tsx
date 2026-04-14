import { HTMLAttributes, forwardRef } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  padding?: "sm" | "md" | "lg";
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ hoverable = false, padding = "md", className = "", children, ...props }, ref) => {
    const base = "bg-surface-container-lowest rounded-2xl";
    const shadow = hoverable
      ? "shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
      : "shadow-card";
    const paddings = {
      sm: "p-4",
      md: "p-6",
      lg: "p-8",
    };

    return (
      <div ref={ref} className={`${base} ${shadow} ${paddings[padding]} ${className}`} {...props}>
        {children}
      </div>
    );
  }
);
Card.displayName = "Card";
export default Card;
