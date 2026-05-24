'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AlertCircle } from 'lucide-react';

interface DeleteConfirmationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
  itemName?: string;
}

export function DeleteConfirmation({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  itemName
}: DeleteConfirmationProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-neutral-200">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <DialogTitle className="text-neutral-900">{title}</DialogTitle>
          </div>
          <DialogDescription className="text-neutral-600 mt-2">
            {description}
          </DialogDescription>
          {itemName && (
            <div className="mt-3 p-3 bg-neutral-100 rounded-lg border border-neutral-200">
              <p className="text-sm font-medium text-neutral-900">
                {itemName}
              </p>
            </div>
          )}
        </DialogHeader>

        <div className="flex gap-2 pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 border-neutral-300 text-neutral-900 hover:bg-neutral-50"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
          >
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
