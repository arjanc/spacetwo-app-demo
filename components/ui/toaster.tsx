"use client";

import { CustomToastContainer, CustomToast } from "@/components/ui/toast";
import { useToast } from "./use-toast";

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <CustomToastContainer toasts={toasts as CustomToast[]} onClose={dismiss} />
  );
}
