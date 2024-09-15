import { PropsWithChildren } from 'react';
import { ScrollArea } from '@repo/components/ui/scroll-area';
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTrigger } from '@repo/components/ui/sheet';
import { Logo, NavMenu } from './navbar';
import { Button } from '@repo/components/ui/button';
import { AlignLeftIcon } from 'lucide-react';
import { DialogTitle } from '@repo/components/ui/dialog';
import { LeftbarProps, SheetLeftbarProps } from './types';

export function Leftbar(props: PropsWithChildren<LeftbarProps>) {
  const { children } = props;
  return (
    <aside className="md:flex hidden flex-[1] min-w-[230px] sticky top-16 flex-col h-[94.5vh] overflow-y-auto">
      <ScrollArea className="py-4">
        {
          children
        }
      </ScrollArea>
    </aside>
  );
}

export function SheetLeftbar(props: PropsWithChildren<SheetLeftbarProps>) {
  const { navlinks, children } = props;
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden flex">
          <AlignLeftIcon />
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col gap-4 px-0" side="left">
        <DialogTitle className="sr-only">Menu</DialogTitle>
        <SheetHeader>
          <SheetClose className="px-5" asChild>
            <Logo />
          </SheetClose>
        </SheetHeader>
        <ScrollArea className="flex flex-col gap-4">
          <div className="flex flex-col gap-2.5 mt-3 mx-2 px-5">
            <NavMenu navlinks={navlinks} isSheet />
          </div>
          <div className="mx-2 px-5">
            {
              children
            }
          </div>
          <div className="p-6 pb-4 flex gap-2.5"></div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
