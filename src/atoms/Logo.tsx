import { cn } from "@/lib/utils";

const LOGO_SRC = "/logo.png";

interface LogoProps {
  className?: string;
  imageClassName?: string;
  showName?: boolean;
  nameClassName?: string;
}

export default function Logo({
  className,
  imageClassName,
  showName = true,
  nameClassName,
}: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <img
        src={LOGO_SRC}
        alt="LetsConnect"
        className={cn("size-9 shrink-0 rounded-full object-cover", imageClassName)}
      />
      {showName && (
        <span className={cn("font-semibold tracking-tight", nameClassName)}>LetsConnect</span>
      )}
    </div>
  );
}

export { LOGO_SRC };
