import { PremiumIcon } from "@/app/components/icons/PremiumIcon";
import { useRouter, useSearchParams } from "next/navigation";
import { ButtonHTMLAttributes } from "react";

interface MainButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  premiumDisabled?: boolean;
  children: React.ReactNode;
}

export function MainButton({
  premiumDisabled,
  children,
  className = "",
  onClick,
  ...props
}: MainButtonProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (premiumDisabled) {
      e.preventDefault();
      router.push("?upgrade=true");
      return;
    }
    onClick?.(e);
  };

  return (
    <button
      className={`main-btn ${className}`}
      onClick={handleClick}
      {...props}
    >
      {children}
      {premiumDisabled && <PremiumIcon />}
    </button>
  );
}
