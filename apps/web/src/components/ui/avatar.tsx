import * as React from "react";

function cn(...classes: Array<string | undefined | false | null>) {
  return classes.filter(Boolean).join(" ");
}

type DivProps = React.HTMLAttributes<HTMLDivElement>;
type ImgProps = React.ImgHTMLAttributes<HTMLImageElement>;

export const Avatar = ({
  className,
  children,
  size = 40,
  ...props
}: DivProps & { size?: number }) => {
  return (
    <div
      className={cn(
        "relative inline-flex select-none items-center justify-center",
        "rounded-full bg-muted/40 ring-1 ring-border overflow-hidden",
        className
      )}
      style={{ width: size, height: size }}
      {...props}
    >
      {children}
    </div>
  );
};

export const AvatarImage = ({ className, ...props }: ImgProps) => {
  return (
    <img
      className={cn("h-full w-full object-cover", className)}
      {...props}
    />
  );
};

export const AvatarFallback = ({
  className,
  children,
  ...props
}: DivProps) => {
  return (
    <div
      className={cn(
        "absolute inset-0 grid place-items-center text-xs font-medium",
        "text-muted-foreground"
      , className)}
      {...props}
    >
      {children}
    </div>
  );
};

export default Avatar;
