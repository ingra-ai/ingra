"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormControl,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import Image from 'next/image'
import { Logger } from "@lib/logger";
import { useToast } from "@components/ui/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { AuthSessionResponse } from "@app/auth/session";
import { type Profile } from "@prisma/client";
import { ProfileSchema } from "@/schemas/profile";
import { censorEmail } from "@lib/functions/censorEmail";
import { APP_URL } from "@lib/constants";
import { updateProfile } from "@/app/(protected)/settings/actions/profile";
import { useCallback } from "react";
import { Input } from "@components/ui/input";

type UserProfileFormProps = {
  authSession: AuthSessionResponse;
}

export const UserProfileForm: React.FC<UserProfileFormProps> = (props) => {
  const { authSession } = props;
  const userProfile: Profile | null = authSession.user.profile;
  const [censoredUser, censoredEmail] = censorEmail(authSession?.user.email || 'unknown@unknown.com');
  const { toast } = useToast();

  const form = useForm<z.infer<typeof ProfileSchema>>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      firstName: userProfile?.firstName || '',
      lastName: userProfile?.lastName || '',
      userName: userProfile?.userName || '',
    }
  });

  const onSubmit = useCallback((values: z.infer<typeof ProfileSchema>) => {
    updateProfile(values).then((data) => {
      toast({
        title: "Profile updated!",
        description: "Profile has been updated successfully.",
      });
    }).catch((error: Error) => {
      toast({
        title: "Uh oh! Something went wrong.",
        description: error?.message || "Failed to update profile!",
      });

      Logger.error(error?.message);
    });
  }, []);

  return (
    <div className="sm:mx-auto sm:w-full sm:max-w-sm" data-testid="user-profile-form">
      <Form {...form}>
        <form className="md:col-span-2" method="POST" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:max-w-xl sm:grid-cols-6">
            <div className="col-span-full flex items-center gap-x-8">
              <Image
                src={`https://ui-avatars.com/api?size=256&name=${censoredUser}`}
                width={256}
                height={256}
                className='h-24 w-24 flex-none rounded-lg bg-gray-800 object-cover'
                alt="user avatar"
              />
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

            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem className="sm:col-span-3">
                  <FormLabel className="block text-sm font-medium leading-6 mb-3">First name</FormLabel>
                  <FormControl>
                    <input
                      id="firstName"
                      {...field}
                      placeholder="John"
                      type="firstName"
                      autoComplete="off"
                      required
                      autoFocus
                      className="block w-full rounded-md border-0 bg-white/5 py-2 px-2 shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem className="sm:col-span-3">
                  <FormLabel className="block text-sm font-medium leading-6 mb-3">Last name</FormLabel>
                  <FormControl>
                    <input
                      id="lastName"
                      {...field}
                      placeholder="Doe"
                      type="lastName"
                      autoComplete="off"
                      required
                      autoFocus
                      className="block w-full rounded-md border-0 bg-white/5 py-2 px-2 shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="col-span-full">
              <label htmlFor="email" className="block text-sm font-medium leading-6 text-white">
                Email address
              </label>
              <div className="mt-2">
                <Input disabled type="email" placeholder={ censoredEmail } />
              </div>
            </div>

            <FormField
              control={form.control}
              name="userName"
              render={({ field }) => (
                <FormItem className="col-span-full">
                  <FormLabel className="block text-sm font-medium leading-6 mb-3">Username</FormLabel>
                  <FormControl>
                    <div className="flex rounded-md bg-white/5 ring-1 ring-inset ring-white/10 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500">
                      <span className="flex select-none items-center pl-3 text-gray-400 sm:text-sm">
                        {APP_URL}/u/
                      </span>
                      <input
                        id="userName"
                        {...field}
                        placeholder="john.doe"
                        type="userName"
                        autoComplete="off"
                        required
                        autoFocus
                        className="block w-full rounded-md border-0 bg-white/5 py-2 px-2 shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="mt-8 flex">
            <button
              type="submit"
              className="rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
            >
              Save
            </button>
          </div>
        </form>
      </Form>
    </div>

  );
}