'use client';

import type { FC, ChangeEvent } from 'react';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import { useToast } from '@components/ui/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AuthSessionResponse } from "@data/auth/session/types";
import { ProfileSchema } from '@/schemas/profile';
import { censorEmail } from '@lib/utils';
import { updateProfile } from '@actions/profile';
import { useCallback, useState, useTransition } from 'react';
import { Input } from '@components/ui/input';
import timezones from 'timezones-list';
import { RefreshCcw } from 'lucide-react';
import { Button } from '@components/ui/button';
import { useRouter } from 'next/navigation';

type UserProfileFormProps = {
  authSession: AuthSessionResponse;
};

export const UserProfileForm: FC<UserProfileFormProps> = (props) => {
  const { authSession } = props;
  const userProfile = authSession.user.profile;
  const [censoredUser, censoredEmail] = censorEmail(authSession?.user.email || 'unknown@unknown.com');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const lockUsername = !!userProfile?.userName;

  const { handleSubmit, register, formState, setValue } = useForm<z.infer<typeof ProfileSchema>>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      firstName: userProfile?.firstName || '',
      lastName: userProfile?.lastName || '',
      userName: userProfile?.userName || '',
      timeZone: userProfile?.timeZone || '',
    },
  });

  const onSubmit = useCallback((values: z.infer<typeof ProfileSchema>) => {
    setIsSaving(true);

    return updateProfile(values)
      .then((result) => {
        if (result.status !== 'ok') {
          throw new Error(result.message);
        }

        toast({
          title: 'Profile updated!',
          description: 'Profile has been updated successfully.',
        });

        startTransition(() => {
          // Refresh the current route and fetch new data from the server without
          // losing client-side browser or React state.
          router.refresh();
        });
      })
      .catch((error: Error) => {
        toast({
          title: 'Uh oh! Something went wrong.',
          description: error?.message || 'Failed to update profile!',
        });
      })
      .finally(() => {
        setIsSaving(false);
      });
  }, []);

  function onTimezoneChanged(e: ChangeEvent<HTMLSelectElement>) {
    setValue('timeZone', e.target.value);
  }

  return (
    <form className="block" method="POST" onSubmit={handleSubmit(onSubmit)} data-testid="user-profile-form" autoComplete='off'>
      <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:max-w-xl sm:grid-cols-6">
        <div className="col-span-full flex items-center gap-x-8">
          <Image src={`https://ui-avatars.com/api?size=256&name=${censoredUser}`} width={256} height={256} className="h-24 w-24 flex-none rounded-lg bg-gray-800 object-cover" alt="user avatar" />
          <div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger type="button" className="rounded-md bg-gray-500 px-3 py-2 text-sm font-semibold text-white shadow-sm">
                  Change avatar
                </TooltipTrigger>
                <TooltipContent>
                  <p>This is not supported at the moment</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <p className="mt-2 text-xs leading-5 text-gray-400">JPG, GIF or PNG. 1MB max.</p>
          </div>
        </div>

        <div className="space-y-2 sm:col-span-3">
          <label htmlFor="firstName" className="block text-sm font-medium leading-6 mb-3">
            First name
          </label>
          <input
            id="firstName"
            {...register('firstName')}
            placeholder="John"
            type="text"
            autoComplete=""
            required
            autoFocus
            className="block w-auto max-w-full rounded-md border-0 bg-white/5 py-2 px-2 shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
          />
          {formState.errors.firstName && <p className="text-sm font-medium text-destructive-foreground mt-3 text-center">{formState.errors.firstName.message}</p>}
        </div>

        <div className="space-y-2 sm:col-span-3">
          <label htmlFor="lastName" className="block text-sm font-medium leading-6 mb-3">
            Last name
          </label>
          <input
            id="lastName"
            {...register('lastName')}
            placeholder="Doe"
            type="text"
            autoComplete=""
            required
            autoFocus
            className="block w-auto max-w-full rounded-md border-0 bg-white/5 py-2 px-2 shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
          />
          {formState.errors.lastName && <p className="text-sm font-medium text-destructive-foreground mt-3 text-center">{formState.errors.lastName.message}</p>}
        </div>

        <div className="col-span-full">
          <label htmlFor="email" className="block text-sm font-medium leading-6 text-white">
            Email address
          </label>
          <div className="mt-2">
            <Input id="email" disabled type="email" placeholder={censoredEmail} />
          </div>
        </div>

        <div className="col-span-full">
          <label htmlFor="timeZone" className="block text-sm font-medium leading-6 text-white">
            Timezone
          </label>
          <div className="mt-2">
            <select
              className="bg-gray-50 w-[280px] border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-secondary dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              onChange={onTimezoneChanged}
              defaultValue={userProfile?.timeZone}
            >
              <option value="UTC">Timezone</option>
              {timezones.map((timezone, index) => (
                <option key={index} value={timezone.tzCode}>
                  {timezone.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2 sm:col-span-full">
          <label htmlFor="userName" className="block text-sm font-medium leading-6 mb-3">
            Username
          </label>
          <Input
            id="userName"
            {...register('userName')}
            placeholder="john.doe"
            type="userName"
            readOnly={lockUsername}
            disabled={lockUsername}
            autoComplete=""
            required
            autoFocus
            className="block w-auto max-w-full rounded-md border-0 bg-white/5 py-2 px-2 shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
          />
          {formState.errors.userName && <p className="text-sm font-medium text-destructive-foreground mt-3 text-center">{formState.errors.userName.message}</p>}
        </div>
      </div>

      <div className="mt-8 flex">
        <Button variant={'default'} type="submit" disabled={isSaving} className="flex w-[120px] justify-center rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500">
          {isSaving && <RefreshCcw className="animate-spin inline-block mr-2" />}
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </form>
  );
};
