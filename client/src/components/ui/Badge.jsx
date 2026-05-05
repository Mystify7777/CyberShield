import { cn } from "./cn";

const variantClassMap = {
  neutral: "bg-gray-100 text-gray-700",
  danger: "bg-red-100 text-red-700",
  info: "bg-blue-100 text-blue-700",
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700"
};

export default function Badge({ variant = "neutral", className, children }) {
  return (
    <span className={cn("px-2 py-1 rounded-sm text-xs", variantClassMap[variant] || variantClassMap.neutral, className)}>
      {children}
    </span>
  );
}
