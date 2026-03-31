import type { ReactNode } from "react";
import { createStore, useStore } from "zustand";
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface ConfirmState {
    open: boolean;
    title: string;
    description: string;
    confirmLabel: ReactNode;
    onConfirm: () => void;
}

interface ContentDialogState {
    open: boolean;
    title: string;
    content: ReactNode | null;
    className?: string;
}

interface DialogStore {
    confirm: ConfirmState;
    content: ContentDialogState;
}

const dialogStore = createStore<DialogStore>(() => ({
    confirm: {
        open: false,
        title: "",
        description: "",
        confirmLabel: "Confirm",
        onConfirm: () => {},
    },
    content: { open: false, title: "", content: null },
}));

/** Show a confirmation dialog. Returns immediately; onConfirm is called if accepted. */
export function confirm(opts: {
    title: string;
    description?: string;
    confirmLabel?: ReactNode;
    onConfirm: () => void;
}) {
    dialogStore.setState({
        confirm: {
            open: true,
            title: opts.title,
            description: opts.description ?? "",
            confirmLabel: opts.confirmLabel ?? "Confirm",
            onConfirm: opts.onConfirm,
        },
    });
}

/** Show a dialog with custom React content. */
export function showDialog(opts: {
    title: string;
    content: ReactNode;
    className?: string;
}) {
    dialogStore.setState({
        content: {
            open: true,
            title: opts.title,
            content: opts.content,
            className: opts.className,
        },
    });
}

/** Close the content dialog. */
export function closeDialog() {
    dialogStore.setState({
        content: { open: false, title: "", content: null },
    });
}

/** Mount this once in App.tsx to render dialogs. */
export function DialogProvider() {
    const confirmState = useStore(dialogStore, (s) => s.confirm);
    const contentState = useStore(dialogStore, (s) => s.content);

    return (
        <>
            <AlertDialog
                open={confirmState.open}
                onOpenChange={(open) => {
                    if (!open)
                        dialogStore.setState({
                            confirm: { ...confirmState, open: false },
                        });
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {confirmState.title}
                        </AlertDialogTitle>
                        {confirmState.description && (
                            <AlertDialogDescription className="whitespace-pre-line">
                                {confirmState.description}
                            </AlertDialogDescription>
                        )}
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                confirmState.onConfirm();
                                dialogStore.setState({
                                    confirm: { ...confirmState, open: false },
                                });
                            }}
                        >
                            {confirmState.confirmLabel}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Dialog
                open={contentState.open}
                onOpenChange={(open) => {
                    if (!open) closeDialog();
                }}
            >
                <DialogContent
                    className={`max-h-[90dvh] overflow-y-auto ${contentState.className ?? ""}`}
                >
                    <DialogHeader>
                        <DialogTitle>{contentState.title}</DialogTitle>
                    </DialogHeader>
                    {contentState.content}
                </DialogContent>
            </Dialog>
        </>
    );
}