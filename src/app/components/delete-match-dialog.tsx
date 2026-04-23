import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { AlertTriangle } from "lucide-react";

interface DeleteMatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  matchId: string;
}

export function DeleteMatchDialog({
  open,
  onOpenChange,
  onConfirm,
  matchId,
}: DeleteMatchDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-destructive/10">
              <AlertTriangle className="size-6 text-destructive" />
            </div>
            <DialogTitle className="text-xl">Delete Match</DialogTitle>
          </div>
          <DialogDescription>
            Are you sure you want to delete match #{matchId}? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-2 border-[#8ec1b8] text-[#006895]"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            className="bg-destructive hover:bg-destructive/90 text-white"
          >
            Delete Match
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
