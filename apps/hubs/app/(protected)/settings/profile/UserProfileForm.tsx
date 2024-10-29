'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Avatar, AvatarFallback } from '@repo/components/ui/avatar';
import { Button } from '@repo/components/ui/button';
import { Input } from '@repo/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@repo/components/ui/tooltip';
import { useToast } from '@repo/components/ui/use-toast';
import { updateProfile } from '@repo/shared/actions/profile';
import { AuthSessionResponse } from '@repo/shared/data/auth/session/types';
import { censorEmail } from '@repo/shared/lib/utils';
import { ProfileSchema } from '@repo/shared/schemas/profile';
import { RefreshCcw, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import timezones from 'timezones-list';
import * as z from 'zod';

import type { FC, ChangeEvent } from 'react';

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
  
  const avatarFallbackText = ((authSession?.user?.profile?.userName || authSession?.user?.email) ?? 'AN').slice(0, 2).toUpperCase();

  return (
    <form className="block" method="POST" onSubmit={handleSubmit(onSubmit)} data-testid="user-profile-form" autoComplete="off">
      <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:max-w-xl sm:grid-cols-6">
        <div className="col-span-full flex items-center gap-x-8">
          <Avatar className="h-24 w-24">
            <AvatarFallback className="text-3xl">{avatarFallbackText}</AvatarFallback>
          </Avatar>
          <div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger type="button" className="rounded-md bg-gray-500 px-3 py-2 font-semibold shadow-sm">
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
          <label htmlFor="firstName" className="block font-medium leading-6 mb-3">
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
            className="block w-auto max-w-full rounded-md border-0 bg-white/5 py-2 px-2 shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:leading-6"
          />
          {formState.errors.firstName && <p className="text-sm font-medium text-destructive-foreground mt-3 text-center">{formState.errors.firstName.message}</p>}
        </div>

        <div className="space-y-2 sm:col-span-3">
          <label htmlFor="lastName" className="block font-medium leading-6 mb-3">
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
            className="block w-auto max-w-full rounded-md border-0 bg-white/5 py-2 px-2 shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:leading-6"
          />
          {formState.errors.lastName && <p className="text-sm font-medium text-destructive-foreground mt-3 text-center">{formState.errors.lastName.message}</p>}
        </div>

        <div className="col-span-full">
          <label htmlFor="email" className="block text-sm font-medium leading-6">
            Email address
          </label>
          <div className="mt-2">
            <Input id="email" disabled type="email" placeholder={censoredEmail} />
          </div>
        </div>

        <div className="col-span-full">
          <label htmlFor="timeZone" className="block text-sm font-medium leading-6">
            Timezone
          </label>
          <div className="mt-2">
            <select
              className="dark:bg-gray-950 bg-gray-50 w-[280px] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-secondary dark:placeholder-gray-600 dark:focus:ring-blue-500 dark:focus:border-blue-500"
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
          <label htmlFor="userName" className="block font-medium leading-6">
            Username
          </label>
          { lockUsername && (
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Username is locked and cannot be changed.
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger type="button" className="ml-2">
                    <Info className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                      <p>Changing the username may impact existing personalized API endpoints. This feature is currently disabled.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </p> 
            )
          }
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
            className="block w-auto max-w-full rounded-md border-0 py-2 px-2 shadow-sm sm:leading-6 mt-3"
          />
          {formState.errors.userName && <p className="font-medium text-destructive-foreground mt-3">{formState.errors.userName.message}</p>}
        </div>
      </div>

      <div className="mt-8 flex">
        <Button
          variant={'indigo'}
          type="submit"
          disabled={isSaving}
          className="flex w-[120px] justify-center rounded-md px-3 py-2 text-sm font-semibold shadow-sm"
        >
          {isSaving && <RefreshCcw className="animate-spin inline-block mr-2" />}
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </form>
  );
};
