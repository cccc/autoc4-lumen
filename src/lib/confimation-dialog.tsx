import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { defineDialog, showDialog, useDialog } from "./dialog";
import type { ReactNode } from "react";

interface ConfirmationDialogProps {
    title: React.ReactNode;
    description?: React.ReactNode;
    confirmLabel?: React.ReactNode;
}
const ConfirmationDialog = defineDialog<boolean>()(function ConfirmationDialog({
    title,
    description,
    confirmLabel,
}: ConfirmationDialogProps) {
    const { resolve, remove } = useDialog<boolean>();

    return (
        <AlertDialog
            defaultOpen
            onOpenChange={(open) => {
                if (!open) {
                    resolve(false);
                    remove();
                }
            }}
        >
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                </AlertDialogHeader>
                {description && (
                    <AlertDialogDescription className="whitespace-pre-line">
                        {description}
                    </AlertDialogDescription>
                )}
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={() => {
                            resolve(true);
                            remove();
                        }}
                    >
                        {confirmLabel}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
});

interface ConfirmProps {
    title: ReactNode;
    description: ReactNode;
    confirmLabel?: ReactNode;
}

export function confirm({
    title,
    description,
    confirmLabel = "Confirm",
}: ConfirmProps): Promise<boolean> {
    return showDialog(ConfirmationDialog, {
        title: title,
        description: description,
        confirmLabel: confirmLabel,
    }).then((result) => result ?? false);
}