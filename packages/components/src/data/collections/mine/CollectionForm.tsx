'use client';

import * as z from 'zod';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../../../ui/button';
import { RefreshCcw } from 'lucide-react';
import { startTransition, useCallback, useState, FC } from 'react';
import { Logger } from '@repo/shared/lib/logger';
import { useToast } from '../../../ui/use-toast';
import { CollectionSchema, MAX_COLLECTION_DESCRIPTION_LENGTH } from '@repo/shared/schemas/collections';
import { createCollection, updateCollection } from '@repo/shared/actions/collections';
import { cn } from '@repo/shared/lib/utils';
import { Input } from '../../../ui/input';
import { Textarea } from '../../../ui/textarea';
import { useRouter } from 'next/navigation';
import { getUserRepoCollectionsViewUri } from '@repo/shared/lib/constants/repo';
import { CollectionDetailViewPayload } from '../types';

type CollectionFormProps = {
  collectionRecord?: CollectionDetailViewPayload;
  onCancel: () => void;
};

export const CollectionForm: FC<CollectionFormProps> = (props) => {
  const { collectionRecord, onCancel } = props;
  const { toast } = useToast();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const ownerUsername = collectionRecord?.owner?.profile?.userName || '';

  const methods = useForm<z.infer<typeof CollectionSchema>>({
      reValidateMode: 'onSubmit',
      resolver: zodResolver(CollectionSchema),
      defaultValues: {
        id: collectionRecord?.id || '',
        name: collectionRecord?.name || '',
        slug: collectionRecord?.slug || '',
        description: collectionRecord?.description || '',
      },
    }),
    {
      register,
      handleSubmit,
      watch,
      formState: { errors },
    } = methods;

  const onSave = useCallback(
    async (values: z.infer<typeof CollectionSchema>) => {
      setIsSaving(true);

      if (collectionRecord?.id) {
        // edit mode
        return await updateCollection(collectionRecord.id, values)
          .then((result) => {
            if (result.status !== 'ok') {
              throw new Error(result.message);
            }

            if (result?.data?.id) {
              toast({
                title: 'Collection updated!',
                description: 'Your collection has been updated.',
              });

              startTransition(() => {
                onCancel();
                
                // Go to the updated collection view
                if ( result?.data?.slug && ownerUsername ) {
                  const redirectUrl = getUserRepoCollectionsViewUri(ownerUsername, result?.data?.slug);
                  router.replace(redirectUrl);
                }
                else {
                  router.refresh();
                }
              });
            }
          })
          .catch((error: Error) => {
            toast({
              variant: 'destructive',
              title: 'Uh oh! Something went wrong.',
              description: error?.message || 'Failed to perform operation!',
            });

            Logger.error(error?.message);
          })
          .finally(() => {
            setIsSaving(false);
          });
      } else {
        return await createCollection(values)
          .then((result) => {
            if (result.status !== 'ok') {
              throw new Error(result.message);
            }
            
            if (result?.data?.id) {
              toast({
                title: 'Collection created!',
                description: 'Your collection has been created.',
              });

              startTransition(() => {
                onCancel();

                // Go to the updated collection view
                if ( result?.data?.slug && ownerUsername ) {
                  const redirectUrl = getUserRepoCollectionsViewUri(ownerUsername, result?.data?.slug);
                  router.replace(redirectUrl);
                }
                else {
                  router.refresh();
                }
              });
            }
          })
          .catch((error: Error) => {
            toast({
              variant: 'destructive',
              title: 'Uh oh! Something went wrong.',
              description: error?.message || 'Failed to perform operation!',
            });

            Logger.error(error?.message);
          })
          .finally(() => {
            setIsSaving(false);
          });
      }
    },
    [collectionRecord?.id]
  );

  const inputClasses = cn('block w-full rounded-md border-0 bg-white/5 py-2 px-2 shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6');

  return (
    <div className="block min-h-full mt-4" data-testid="collection-form">
      <FormProvider {...methods}>
        <form className="block" method="POST" onSubmit={handleSubmit(onSave)} autoComplete="off">
          <div className="block space-y-6">
            <div className="block space-y-2">
              <div className="flex mb-3 leading-6 justify-between">
                <label className="block text-sm font-medium">Collection Name</label>
              </div>
              <Input id="name" {...register('name')} placeholder="Collection Name" aria-autocomplete="none" autoComplete="" type="text" required autoFocus />
              {errors.name && <p className="text-sm font-medium text-destructive-foreground mt-3">{errors.name.message}</p>}
            </div>
            <div className="block space-y-2">
              <label htmlFor="slug" className="block text-sm font-medium leading-6">
                Slug
              </label>
              <Input id="slug" {...register('slug')} placeholder="collection-slug" aria-autocomplete="none" autoComplete="" type="text" required />
              {errors.slug && <p className="text-sm font-medium text-destructive-foreground mt-3">{errors.slug.message}</p>}
            </div>
            <div className="block space-y-2">
              <label htmlFor="description" className="block text-sm font-medium leading-6">
                Description
              </label>
              <Textarea {...register(`description`)} placeholder="A description of what this collection automates." rows={8} className={`col-span-12 text-sm`} />
              <div className="col-span-12 grid grid-cols-12 mt-3">
                <div className="col-span-8 text-left">{errors.description && <p className="text-sm font-medium text-destructive-foreground mt-3">{errors.description.message}</p>}</div>
                <div className="col-span-4 text-right">
                  <p className="text-xs text-muted-foreground">{`${watch(`description`)?.length || 0}/${MAX_COLLECTION_DESCRIPTION_LENGTH} characters`}</p>
                </div>
              </div>
            </div>
            <div className="flex w-full justify-end items-center space-x-4">
              <Button variant={'destructive'} type="button" disabled={isSaving} className="flex w-[160px] justify-center rounded-md px-3 py-1.5 text-sm font-semibold leading-8 shadow-sm" onClick={onCancel}>
                Cancel
              </Button>
              <Button variant={'default'} type="submit" disabled={isSaving} className="flex w-[160px] justify-center rounded-md px-3 py-1.5 text-sm font-semibold leading-8 shadow-sm">
                {isSaving && <RefreshCcw className="animate-spin inline-block mr-2" />}
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};
