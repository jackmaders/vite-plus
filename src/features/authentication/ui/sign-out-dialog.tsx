import { useState, type ComponentProps } from "react";

import { signOut } from "@/shared/auth";
import { Button } from "@/shared/ui/shadcn/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/shadcn/dialog";

export function SignOutDialog({ ...props }: ComponentProps<typeof DialogTrigger>) {
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function handleSignOut() {
    setIsPending(true);
    setError("");
    try {
      const response = await signOut();
      if (response.error) {
        setError(response.error.message ?? "Sign out failed");
      } else {
        window.location.href = "/";
      }
    } catch {
      setError("An unexpected error occurred");
    }
    setIsPending(false);
  }

  return (
    <Dialog>
      <DialogTrigger render={<Button variant="ghost" size="sm" />} {...props}>
        Sign Out
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sign out?</DialogTitle>
          <DialogDescription>Are you sure you want to sign out?</DialogDescription>
        </DialogHeader>
        {error && <p role="alert">{error}</p>}
        <DialogFooter>
          <DialogClose render={<Button variant="ghost" />}>Cancel</DialogClose>
          <Button
            disabled={isPending}
            onClick={() => {
              void handleSignOut();
            }}
          >
            Sign Out
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
