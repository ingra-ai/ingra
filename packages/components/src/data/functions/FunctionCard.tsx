'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import type { FunctionCardPayload } from './types';
import { Badge } from '@repo/components/ui/badge';
import { ScrollArea, ScrollBar } from '@repo/components/ui/scroll-area';
import { Button } from '@repo/components/ui/button';
import { Code, Trash2, Lock, Unlock, ShoppingBag, Tag, List, Bell, RefreshCcw } from 'lucide-react';
import AddFunctionToCollectionButton from './AddFunctionToCollectionButton';
import { AuthSessionResponse } from '@repo/shared/data/auth/session/types';

interface FunctionCardProps {
  functionData: FunctionCardPayload;
  href: string;
  authSession?: AuthSessionResponse | null;
  handleSubscribe?: (record: FunctionCardPayload) => Promise<void>;
  handleUnsubscribe?: (record: FunctionCardPayload) => Promise<void>;
  handleDelete?: (record: FunctionCardPayload) => Promise<void>;
  handleClone?: (record: FunctionCardPayload) => Promise<void>;
  handleCollectionToggle?: (collectionId: string, record: FunctionCardPayload, checked: boolean) => Promise<void>;
}

export const FunctionCard: React.FC<FunctionCardProps> = (props) => {
  const { functionData: func, href, authSession, handleSubscribe: onHandleSubscribe, handleUnsubscribe: onHandleUnsubscribe, handleDelete: onHandleDelete, handleClone: onHandleClone } = props;

  const [cardState, setCardState] = useState({
    isSubscribing: false,
    isDeleting: false,
    isCloning: false,
  });

  const handleSubscribe = async (record: FunctionCardPayload) => {
    if (typeof onHandleSubscribe !== 'function') {
      return null;
    }

    setCardState({ ...cardState, isSubscribing: true });

    return onHandleSubscribe(record).finally(() => {
      setCardState({ ...cardState, isSubscribing: false });
    });
  };

  const handleUnsubscribe = async (record: FunctionCardPayload) => {
    if (typeof onHandleUnsubscribe !== 'function') {
      return null;
    }

    setCardState({ ...cardState, isSubscribing: true });

    return onHandleUnsubscribe(record).finally(() => {
      setCardState({ ...cardState, isSubscribing: false });
    });
  };

  const handleDelete = async (record: FunctionCardPayload) => {
    if (typeof onHandleDelete !== 'function') {
      return null;
    }

    setCardState({ ...cardState, isDeleting: true });

    return onHandleDelete(record).finally(() => {
      setCardState({ ...cardState, isDeleting: false });
    });
  };

  const handleClone = async (record: FunctionCardPayload) => {
    if (typeof onHandleClone !== 'function') {
      return null;
    }

    setCardState({ ...cardState, isCloning: true });

    return onHandleClone(record).finally(() => {
      setCardState({ ...cardState, isCloning: false });
    });
  };

  const isInMarketplace = func.isPublished && !func.isPrivate,
    userIsOwner = authSession?.user?.id && func.owner?.id && authSession?.user?.id === func.owner?.id,
    canSubscribe = !userIsOwner && typeof onHandleSubscribe === 'function',
    canUnsubscribe = !userIsOwner && typeof onHandleUnsubscribe === 'function',
    canDelete = userIsOwner && typeof onHandleDelete === 'function',
    canClone = typeof onHandleClone === 'function',
    canCollectionToggle = userIsOwner;

  return (
    <div className="group relative overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800 bg-card shadow-md transition-all duration-300 hover:shadow-xl dark:hover:shadow-gray-800">
      <div className="absolute -right-16 -top-16 h-32 w-32 rounded-full bg-primary/10 transition-all duration-300 group-hover:scale-150" />
      <div className="absolute -left-16 -bottom-16 h-32 w-32 rounded-full bg-secondary/10 transition-all duration-300 group-hover:scale-150" />
      <div className="relative p-6 flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center truncate mr-2">
            {func.isPrivate ? <Lock className="mr-2 h-4 w-4 flex-shrink-0" /> : <Unlock className="mr-2 h-4 w-4 flex-shrink-0" />}
            <Link href={href} className="truncate cursor-pointer" title={func.slug} aria-label={func.slug}>
              {func.slug}
            </Link>
          </h3>
          <div className="flex items-center space-x-2 flex-shrink-0">
            {isInMarketplace && (
              <Badge variant="secondary" className="flex items-center px-2 py-1" title="Available in Marketplace">
                <ShoppingBag className="mr-1 h-3 w-3" />
              </Badge>
            )}
            <Badge variant={func.isPrivate ? 'secondary' : 'default'} className="px-2 py-1">
              {func.isPrivate ? 'Private' : 'Public'}
            </Badge>
          </div>
        </div>
        <Link href={href} className="cursor-pointer" title={func.description}>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">{func.description}</p>
        </Link>
        <ScrollArea className="mb-4 w-full overflow-x-auto">
          <div className="w-full whitespace-nowrap">
            <div className="flex gap-2 mb-2">
              {func.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="flex items-center text-xs px-2 py-1">
                  <Tag className="mr-1 h-2 w-2" />
                  {tag.name}
                </Badge>
              ))}
            </div>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
        <div className="flex justify-between items-center mb-4 mt-auto">
          <Badge className="flex items-center px-2 py-1">
            <Code className="mr-1 h-3 w-3" />
            {func.httpVerb}
          </Badge>
          <Badge variant="outline" className="flex items-center px-2 py-1">
            <List className="mr-1 h-3 w-3" />
            {func.arguments.length} {func.arguments.length === 1 ? 'argument' : 'arguments'}
          </Badge>
        </div>
        <div className="flex flex-wrap justify-between gap-2">
          {canDelete && (
            <Button type="button" aria-label="Delete function" title="Delete function" variant="destructive" size="sm" onClick={() => handleDelete(func)}>
              {cardState.isDeleting ? <RefreshCcw className="w-4 h-4 animate-spin inline-block" /> : <Trash2 className="w-4 h-4 inline-block" />}
              <span className="sr-only">Delete</span>
            </Button>
          )}
          {canSubscribe && (
            <Button type="button" aria-label="Subscribe to gain access to invoke this function" title="Subscribe to gain access to invoke this function" variant="indigo" size="sm" onClick={() => handleSubscribe(func)}>
              {cardState.isSubscribing ? <RefreshCcw className="w-4 h-4 animate-spin inline-block mr-2" /> : <Bell className="w-4 h-4 inline-block mr-2" />}
              Subscribe
            </Button>
          )}
          {canUnsubscribe && (
            <Button type="button" aria-label="Unsubscribe from this function" title="Unsubscribe from this function" variant="destructive" size="sm" onClick={() => handleUnsubscribe(func)}>
              {cardState.isSubscribing ? <RefreshCcw className="w-4 h-4 animate-spin inline-block mr-2" /> : <Bell className="w-4 h-4 inline-block mr-2" />}
              Unsubscribe
            </Button>
          )}
          {canCollectionToggle && <AddFunctionToCollectionButton functionRecord={func} userId={authSession?.user?.id} />}
        </div>
      </div>
    </div>
  );
};
