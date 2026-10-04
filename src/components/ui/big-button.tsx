import { cn } from "@/lib/utils";
import { Button as ButtonPrimitive } from "@base-ui/react";
import { cva } from "class-variance-authority";
import type { LucideProps } from "lucide-react";
import type React from "react";
import { cloneElement } from "react";

const bigButtonVariants = cva(
    "group/button w-full aspect-square rounded-lg flex flex-col items-center justify-center gap-1.5 font-medium text-white transition-colors active:scale-95",
    {
        variants: {
            color: {
                on: "bg-on hover:bg-on-hover",
                off: "bg-off hover:bg-off-hover",
                unknown: "bg-muted text-muted-foreground",
            },
        },
        defaultVariants: {
            color: "unknown",
        },
    },
);

type BigButtonVariantProps = {
    color?: "on" | "off" | "unknown";
};
type BigButtonProps = React.ComponentProps<typeof ButtonPrimitive> &
    BigButtonVariantProps;

/**
 * The shared square tile button used for lights, presets, and other controls.
 * Pass a background color class and icon + label as children.
 */
export default function BigButton({
    color,
    className,
    ...props
}: BigButtonProps) {
    return (
        <ButtonPrimitive
            type="button"
            className={cn(bigButtonVariants({ color }), className)}
            {...props}
        />
    );
}

function BigButtonIcon({
    children,
}: {
    children: React.ReactElement<LucideProps>;
}) {
    return cloneElement(children, {
        className: cn("size-12", children.props.children),
        strokeWidth: 1.25,
    });
}

function BigButtonLabel({ className, ...props }: React.ComponentProps<"span">) {
    return (
        <span
            className={cn("text-xs leading-tight text-center px-1", className)}
            {...props}
        />
    );
}

BigButton.Icon = BigButtonIcon;
BigButton.Label = BigButtonLabel;