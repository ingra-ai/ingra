"use client";

import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@repo/components/ui/alert-dialog";
import { Button } from "@repo/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@repo/components/ui/sheet";
import { useToast } from '@repo/components/ui/use-toast';
import { AuthSessionResponse } from "@repo/shared/data/auth/session/types";
import cx from "classnames";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import useSWR from "swr";

import { getChatUri } from "@/lib/constants";
import { fetcher } from "@/lib/utils";

import {
  InfoIcon,
  MenuIcon,
  MoreHorizontalIcon,
  PencilEditIcon,
  TrashIcon,
} from "./icons";

import type { Chat } from '@repo/db/prisma';
import type { ApiSuccess } from "@repo/shared/types";


type HistoryProps = {
  className?: string;
  authSession?: AuthSessionResponse;
};

export const History = (props: HistoryProps) => {
  const { chatId = '' } = useParams();
  const { toast } = useToast();
  const pathname = usePathname();
  const { authSession, className } = props;
  const {
    data,
    isLoading,
    mutate,
  } = useSWR<ApiSuccess<Omit<Chat, 'messages'>>>(authSession ? "/api/v1/history" : null, fetcher, {
    fallbackData: { status: 'success', message: '', data: [] },
  });

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    mutate();
  }, [pathname, mutate]);

  const handleDelete = async () => {
    fetch(`/api/v1/chat?id=${deleteId}`, {
      method: "DELETE",
    }).then((res) => {
      toast({
        variant: 'default',
        title: "Chat deleted",
        description: "Chat deleted successfully",
      });

      mutate((data) => {
        if (data?.data && Array.isArray(data.data)) {
          return {
            ...data,
            data: data.data.filter((h) => h.id !== chatId),
          };
        }
        return data;
      });
    }).catch((error) => {
      toast({
        variant: 'destructive',
        title: "Failed to delete chat",
        description: error?.message || "Failed to delete chat"
      });
    }).finally(() => {
      setShowDeleteDialog(false);
    });
  };

  const history = Array.isArray(data?.data) ? data.data : undefined;

  return (
    <div className={className} data-testid="history">
      <div className="text-sm flex flex-row items-center justify-between">
        <div className="flex flex-row gap-2 items-center">
          <div className="dark:text-zinc-300">History</div>

          <div className="dark:text-gray-400 text-gray-500 text-xs">
            {history === undefined ? "loading" : history.length} chats
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-col">
        {authSession && (
          <Button
            className="font-normal text-sm flex flex-row justify-between"
            asChild
          >
            <Link href={getChatUri()} prefetch={false}>
              <div>Start a new chat</div>
              <PencilEditIcon size={14} />
            </Link>
          </Button>
        )}

        <div className="flex flex-col overflow-y-auto p-1 h-full">
          {!authSession ? (
            <div className="h-dvh w-full flex flex-row justify-center items-center text-sm gap-2">
              <InfoIcon />
              <div>Login to save and revisit previous chats!</div>
            </div>
          ) : null}

          {!isLoading && history?.length === 0 && authSession ? (
            <div className="h-dvh w-full flex flex-row justify-center items-center text-sm gap-2">
              <InfoIcon />
              <div>No chats found</div>
            </div>
          ) : null}

          {isLoading && authSession ? (
            <div className="flex flex-col">
              {[44, 32, 28, 52].map((item) => (
                <div key={item} className="p-2 my-[2px]">
                  <div
                    className={`w-${item} h-[20px] rounded-md bg-gray-800 dark:bg-gray-400 animate-pulse`}
                  />
                </div>
              ))}
            </div>
          ) : null}

          {Array.isArray(history) && history.length > 0 && authSession &&
            history.map((chat) => {
              const chatName = chat?.name || `Untitled`;
              return (
                <div
                  key={chat.id}
                  className={cx(
                    "flex flex-row items-center gap-6 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-md pr-2",
                    { "bg-gray-100 dark:bg-gray-900": chatId && chat.id === chatId },
                  )}
                >
                  <Button
                    variant="ghost"
                    className={cx(
                      "hover:bg-gray-100 dark:hover:bg-gray-900 justify-between p-0 text-sm font-normal flex flex-row items-center gap-2 pr-2 w-full transition-none",
                    )}
                    asChild
                  >
                    <Link
                      href={getChatUri(chat.id)}
                      className="text-ellipsis overflow-hidden text-left py-2 pl-2 rounded-lg outline-zinc-900"
                    >
                      {chatName}
                    </Link>
                  </Button>

                  <DropdownMenu modal={true}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        className="p-0 h-fit font-normal text-gray-500 transition-none hover:bg-gray-300 dark:hover:bg-gray-700"
                        variant="ghost"
                      >
                        <MoreHorizontalIcon />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="left" className="z-[60]">
                      <DropdownMenuItem asChild>
                        <Button
                          className="flex flex-row gap-2 items-center justify-start w-full h-fit font-normal p-1.5 rounded-sm"
                          variant="ghost"
                          onClick={() => {
                            setDeleteId(chat.id);
                            setShowDeleteDialog(true);
                          }}
                        >
                          <TrashIcon />
                          <div>Delete</div>
                        </Button>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            })}
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              chat and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export const HistorySheet = (props: HistoryProps) => {
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        className="p-1.5 h-fit"
        onClick={() => {
          setIsHistoryVisible(true);
        }}
      >
        <MenuIcon />
      </Button>

      <Sheet
        open={isHistoryVisible}
        onOpenChange={(state) => {
          setIsHistoryVisible(state);
        }}
      >
        <SheetContent side="left" className="p-3 w-80 bg-muted">
          <SheetHeader>
            <VisuallyHidden.Root>
              <SheetTitle className="text-left">History</SheetTitle>
              <SheetDescription className="text-left">
                {history === undefined ? "loading" : history.length} chats
              </SheetDescription>
            </VisuallyHidden.Root>
          </SheetHeader>

          <History {...props} />
        </SheetContent>
      </Sheet>
    </>
  );
};