import * as React from "react";
import { X } from "lucide-react";

interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

interface DialogContentProps {
  className?: string;
  children: React.ReactNode;
}

const Dialog = ({ open, onOpenChange, children }: DialogProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange?.(false)}
      />
      {/* Dialog content */}
      {children}
    </div>
  );
};

const DialogContent = ({ className = "", children }: DialogContentProps) => {
  return (
    <div
      className={`relative z-50 bg-white rounded-lg shadow-2xl p-6 ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  );
};

const DialogHeader = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  return <div className={`mb-4 ${className}`}>{children}</div>;
};

const DialogTitle = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  return <h2 className={`text-xl font-semibold ${className}`}>{children}</h2>;
};

const DialogDescription = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  return <p className={`text-sm text-muted-foreground mt-2 ${className}`}>{children}</p>;
};

const DialogFooter = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  return <div className={`flex items-center justify-end mt-6 ${className}`}>{children}</div>;
};

const DialogClose = ({ onClick }: { onClick?: () => void }) => {
  return (
    <button
      onClick={onClick}
      className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 transition-opacity"
    >
      <X className="size-4" />
      <span className="sr-only">Close</span>
    </button>
  );
};

export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose };
