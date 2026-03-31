import { cn } from "@/lib/utils";

interface BigButtonProps {
    onClick: () => void;
    className?: string;
    children: React.ReactNode;
}

/**
 * The shared square tile button used for lights, presets, and other controls.
 * Pass a background color class and icon + label as children.
 */
export default function BigButton({
    onClick,
    className,
    children,
}: BigButtonProps) {
    return (
        <button
            type="button"
            className={cn(
                "w-full aspect-square rounded-lg flex flex-col items-center justify-center gap-1.5 font-medium text-white transition-colors active:scale-95",
                className,
            )}
            onClick={onClick}
        >
            {children}
        </button>
    );
}