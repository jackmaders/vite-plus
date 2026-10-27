import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { useState, type ComponentProps, type ReactNode } from "react";

import { Button } from "@/shared/ui/shadcn/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/shared/ui/shadcn/drawer";

interface MobileDrawerProps extends ComponentProps<typeof DrawerTrigger> {
  authActions: ReactNode;
  links: ComponentProps<typeof Link>[];
}

function MobileDrawer({ authActions, links, ...props }: MobileDrawerProps) {
  const [open, setOpen] = useState(false);

  return (
    <Drawer open={open} onOpenChange={setOpen} swipeDirection="left">
      <DrawerTrigger
        render={<Button variant="ghost" size="sm" />}
        aria-label="Open menu"
        {...props}
      >
        <Menu className="size-5" />
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Navigation</DrawerTitle>
          <DrawerDescription>Menu and links</DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 p-4">
          {links.map((link) => (
            <Link
              key={link.to}
              {...link}
              onClick={() => {
                setOpen(false);
              }}
            />
          ))}
          {authActions}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

export { MobileDrawer };
