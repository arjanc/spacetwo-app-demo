"use client";

import * as React from "react";
import * as ToastPrimitives from "@radix-ui/react-toast";
import { X, CheckCircle, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { cn } from "@/lib/utils";

const ToastProvider = ToastPrimitives.Provider;

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
      className
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

const toastVariants = {
  initial: {
    opacity: 0,
    y: 50,
    scale: 0.3,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
  },
  exit: {
    opacity: 0,
    scale: 0.5,
    transition: { duration: 0.2 },
  },
};

export interface CustomToast {
  id: string;
  title: string;
  description?: string;
  type: "success" | "error" | "warning";
}

interface CustomToastProps {
  toast: CustomToast;
  onClose: (id: string) => void;
}

export const CustomToastNotification: React.FC<CustomToastProps> = ({
  toast,
  onClose,
}) => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, 5000);

    return () => clearTimeout(timer);
  }, [toast.id, onClose]);

  return (
    <motion.div
      layout
      variants={toastVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`${
        toast.type === "success" 
          ? "bg-[#1a2e1a]" 
          : toast.type === "warning"
          ? "bg-[#2e2a1a]"
          : "bg-[#2e1a1a]"
      } border ${
        toast.type === "success" 
          ? "border-[#2d5a2d]" 
          : toast.type === "warning"
          ? "border-[#5a5a2d]"
          : "border-[#5a2d2d]"
      } rounded-lg p-4 shadow-lg flex items-start gap-3 min-w-[300px] max-w-[400px]`}
    >
      {toast.type === "success" ? (
        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
      ) : toast.type === "warning" ? (
        <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
      ) : (
        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <h4 className="text-white font-medium mb-1">{toast.title}</h4>
        {toast.description && (
          <p className="text-[#827989] text-sm">{toast.description}</p>
        )}
      </div>
      <button
        onClick={() => onClose(toast.id)}
        className="text-[#827989] hover:text-white transition-colors flex-shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

interface CustomToastContainerProps {
  toasts: CustomToast[];
  onClose: (id: string) => void;
}

export const CustomToastContainer: React.FC<CustomToastContainerProps> = ({
  toasts,
  onClose,
}) => {
  return (
    <div className="fixed bottom-0 right-0 p-4 z-50 flex flex-col items-end gap-2">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <CustomToastNotification
            key={toast.id}
            toast={toast}
            onClose={onClose}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive",
      className
    )}
    {...props}
  />
));
ToastAction.displayName = ToastPrimitives.Action.displayName;

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600",
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
));
ToastClose.displayName = ToastPrimitives.Close.displayName;

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-sm font-semibold", className)}
    {...props}
  />
));
ToastTitle.displayName = ToastPrimitives.Title.displayName;

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-sm opacity-90", className)}
    {...props}
  />
));
ToastDescription.displayName = ToastPrimitives.Description.displayName;

type ToastActionElement = React.ReactElement<typeof ToastAction>;

export {
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
};
