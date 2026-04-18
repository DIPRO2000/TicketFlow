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
import { AlertTriangle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ConfirmDialog({ 
  open, 
  onOpenChange, 
  title, 
  description, 
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  variant = "destructive" // "destructive" | "warning"
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            {variant === "destructive" && (
              <div className="p-2 bg-rose-100 rounded-full">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
            )}
            {variant === "warning" && (
              <div className="p-2 bg-amber-100 rounded-full">
                <XCircle className="w-5 h-5 text-amber-600" />
              </div>
            )}
            <AlertDialogTitle>{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-2">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={cn(
              variant === "destructive" && "bg-rose-600 hover:bg-rose-700 text-white",
              variant === "warning" && "bg-amber-600 hover:bg-amber-700 text-white"
            )}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}