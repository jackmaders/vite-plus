import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

import { Button } from "@/shared/ui/shadcn/button";
import {
  Drawer,
  DrawerClose,
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
  return (
    <Drawer swipeDirection="left">
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
            <DrawerClose key={link.to} render={<Link {...link} />} />
          ))}
          {authActions}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

export { MobileDrawer };
