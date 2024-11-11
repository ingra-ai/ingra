"use client";

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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@repo/components/ui/sidebar";
import { Skeleton } from "@repo/components/ui/skeleton";
import { useToast } from "@repo/components/ui/use-toast";
import { AuthSessionResponse } from "@repo/shared/data/auth/session/types";
import cx from "classnames";
import {
  Folder,
  MoreHorizontal,
  Share,
  Trash2,
  Pencil,
  Plus,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import useSWR from "swr";

import { fetcher } from "@/lib/utils";

import type { Chat } from "@repo/db/prisma";
import type { ApiSuccess } from "@repo/shared/types";

type HistoryItem = Pick<Chat, "id" | "name">;

type NavHistoriesProps = {
  authSession: AuthSessionResponse;
};

export function NavHistories({ authSession }: NavHistoriesProps) {
  const { isMobile } = useSidebar();
  const { chatId = "" } = useParams();
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();

  const { data, isLoading, mutate } = useSWR<ApiSuccess<HistoryItem>>(
    authSession ? "/api/v1/history" : null,
    fetcher,
    {
      fallbackData: { status: "success", message: "", data: [] },
    }
  );

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    mutate();
  }, [pathname, mutate]);

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const res = await fetch(`/api/v1/chat?id=${deleteId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete chat");
      }

      toast({
        variant: "default",
        title: "Chat deleted",
        description: "Chat deleted successfully",
      });

      mutate((currentData) => {
        if (currentData?.data && Array.isArray(currentData.data)) {
          return {
            ...currentData,
            data: currentData.data.filter((h) => h.id !== deleteId),
          };
        }
        return currentData;
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to delete chat",
        description: error?.message || "Failed to delete chat",
      });
    } finally {
      setShowDeleteDialog(false);
      setDeleteId(null);
    }
  };

  const history = Array.isArray(data?.data) ? data.data : [];

  return (
    <>
      <SidebarGroup className="group-data-[collapsible=icon]:hidden" data-testid="nav-histories">
        <SidebarGroupLabel>Threads</SidebarGroupLabel>
        <SidebarMenu>
          {authSession && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/" className="flex items-center gap-2">
                  <Plus />
                  <span>Start a new chat</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}

          {isLoading && authSession && (
            <SidebarMenuItem>
              <Skeleton className="h-4 mb-3 bg-gray-300 rounded"></Skeleton>
              <Skeleton className="h-4 mb-3 bg-gray-300 rounded w-[90%]"></Skeleton>
              <Skeleton className="h-4 bg-gray-300 rounded w-[95%]"></Skeleton>
            </SidebarMenuItem>
          )}

          {!isLoading && history.length === 0 && authSession && (
            <SidebarMenuItem className="p-2 my-10">
              <div className="text-sm text-gray-500">No chats found</div>
            </SidebarMenuItem>
          )}

          {!authSession && (
            <SidebarMenuItem className="p-2 my-10">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Folder />
                <span>Login to save and revisit previous chats!</span>
              </div>
            </SidebarMenuItem>
          )}

          {history.map((chat) => (
            <SidebarMenuItem key={chat.id}>
              <SidebarMenuButton asChild>
                <Link href={`/${chat.id}`} className="flex items-center gap-2">
                  <span
                    className={cx("truncate", {
                      "font-bold": chat.id === chatId,
                    })}
                  >
                    {chat.name || "Untitled"}
                  </span>
                </Link>
              </SidebarMenuButton>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuAction showOnHover>
                    <MoreHorizontal />
                    <span className="sr-only">More</span>
                  </SidebarMenuAction>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-48"
                  side={isMobile ? "bottom" : "right"}
                  align={isMobile ? "end" : "start"}
                >
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onSelect={() => {
                      setDeleteId(chat.id);
                      setShowDeleteDialog(true);
                    }}
                  >
                    <Trash2 size={16} className="text-muted-foreground mr-2" />
                    <span>Delete Chat</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this chat?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The chat will be permanently deleted from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
