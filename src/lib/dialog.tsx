import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    createContext,
    use,
    type ComponentProps,
    type ComponentType,
    type PropsWithChildren,
    type ReactNode,
} from "react";
import { createStore, useStore } from "zustand";
import { cn } from "@/lib/utils";

/**
 * Controls for the dialog it is read from, via useDialog. Settling the promise
 * and unmounting are separate, so the dialog can resolve right away and remove
 * itself whenever it is done animating, e.g.
 * `document.startViewTransition(() => flushSync(remove))`.
 */
export interface DialogHandle<R = void> {
    /** Settle the caller's promise with a result. Later calls are ignored. */
    resolve: (result: R) => void;
    /** Reject the caller's promise. Later calls are ignored. */
    reject: (reason?: unknown) => void;
    /** Unmount the dialog. Resolves with `undefined` if it was not settled yet. */
    remove: () => void;
}

/**
 * A component with its result type attached, so showDialog can infer it.
 * The property only exists at the type level.
 */
export type DialogComponent<P, R> = ComponentType<P> & {
    readonly __dialogResult?: R;
};

/**
 * Attach a result type to a dialog component:
 * `defineDialog<boolean>()(function ConfirmDialog(props: Props) { ... })`.
 * Not needed for dialogs that resolve nothing.
 */
export function defineDialog<R>() {
    return <P,>(Component: ComponentType<P>) =>
        Component as DialogComponent<P, R>;
}

interface DialogEntry {
    id: number;
    // oxlint-disable-next-line no-explicit-any -- erased at the store boundary, typed at showDialog
    Component: ComponentType<any>;
    props: object;
    handle: DialogHandle<unknown>;
}

const dialogStore = createStore<{ stack: DialogEntry[] }>(() => ({
    stack: [],
}));

const DialogContext = createContext<DialogHandle<unknown> | null>(null);

let nextId = 0;

/**
 * Access the surrounding dialog's handle. Only valid inside a component shown
 * via showDialog; R should match the result type given to defineDialog.
 */
export function useDialog<R = void>(): DialogHandle<R> {
    const handle = use(DialogContext);
    if (!handle) {
        throw new Error(
            "useDialog must be used inside a dialog shown via showDialog",
        );
    }
    return handle as DialogHandle<R>;
}

function removeDialog(id: number) {
    const entry = dialogStore.getState().stack.find((d) => d.id === id);
    if (!entry) return;
    dialogStore.setState((s) => ({
        stack: s.stack.filter((d) => d.id !== id),
    }));
    entry.handle.resolve(undefined);
}

/**
 * Mount a dialog component. Resolves with whatever it passes to `resolve`, or
 * `undefined` if it is removed without settling. Props may be omitted when
 * the component has no required props.
 */
export function showDialog<P extends object, R = void>(
    Component: DialogComponent<P, R>,
    ...[props]: object extends P ? [props?: P] : [props: P]
): Promise<R | undefined> {
    return new Promise((resolve, reject) => {
        const id = nextId++;
        const entry: DialogEntry = {
            id,
            Component,
            props: props ?? {},
            // created once per entry so the context value stays stable
            handle: {
                resolve: resolve as (result: unknown) => void,
                reject,
                remove: () => removeDialog(id),
            },
        };
        dialogStore.setState((s) => ({ stack: [...s.stack, entry] }));
    });
}

/** Unmount every open dialog, resolving unsettled ones with `undefined`. */
export function removeAllDialogs() {
    const { stack } = dialogStore.getState();
    if (stack.length === 0) return;
    dialogStore.setState({ stack: [] });
    for (const entry of stack) entry.handle.resolve(undefined);
}

/** Mount this once near the root of the app. */
export function DialogHost() {
    const stack = useStore(dialogStore, (s) => s.stack);

    return stack.map(({ id, Component, props, handle }) => (
        <DialogContext key={id} value={handle}>
            <Component {...props} />
        </DialogContext>
    ));
}

export interface BaseDialogProps extends PropsWithChildren {
    title: ReactNode;
    /** Merged into the popup's classes, e.g. `sm:max-w-lg` for wider dialogs. */
    className?: string;
}

/** Standard dialog shell; closing it removes the surrounding dialog. */
export function BaseDialog({ title, className, children }: BaseDialogProps) {
    const { remove } = useDialog<unknown>();

    return (
        <Dialog
            defaultOpen
            onOpenChange={(open) => {
                if (!open) remove();
            }}
        >
            <DialogContent
                className={cn("max-h-[90dvh] overflow-y-auto", className)}
            >
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                {children}
            </DialogContent>
        </Dialog>
    );
}

export function DialogCloseButton(props: ComponentProps<typeof Button>) {
    const { remove } = useDialog<unknown>();

    const handleClick: ComponentProps<typeof Button>["onClick"] = (e) => {
        props.onClick?.(e);
        remove();
    };

    return <Button {...props} onClick={handleClick} />;
}