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
        className={cn("size-7 rounded-full object-cover ring-2 ring-indigo-100 sm:size-10", imageClassName)}
      />
      {showName && (
        <span className={cn("font-semibold tracking-tight", nameClassName)}>LetsConnect</span>
      )}
    </div>
  );
}

export { LOGO_SRC };
