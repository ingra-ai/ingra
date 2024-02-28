"use client";

import * as z from "zod";
import { MagicLoginSchema } from "@/schemas/auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { magicLogin } from "@app/auth/actions/login";
import {
  Form,
  FormField,
  FormControl,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { useState } from "react";
import { Logger } from "@lib/logger";
import { useToast } from "@components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@components/ui/button";

export const MagicLoginForm: React.FC = () => {
  const { toast } = useToast();
  const [isEmailSent, setEmailSent] = useState(false);

  const form = useForm<z.infer<typeof MagicLoginSchema>>({
    resolver: zodResolver(MagicLoginSchema),
    defaultValues: {
      email: ""
    }
  });

  const onSubmit = (values: z.infer<typeof MagicLoginSchema>) => {
    magicLogin(values).then((data) => {
      setEmailSent(true);
    }).catch((error: Error) => {
      toast({
        title: "Uh oh! Something went wrong.",
        description: error?.message || "Failed to send magic link!",
      });

      Logger.error(error?.message);
    });
  }

  if (isEmailSent) {
    return (
      <Card className="mt-8 text-center font-medium">
        <CardHeader className="space-y-3">
          <CardTitle>Check your email</CardTitle>
        </CardHeader>
        <CardContent className="">
          <p className="text-sm text-foreground">We sent a magic link to your email.</p>
        </CardContent>
        <CardFooter className="justify-center flex-col">
          <p className="text-muted-foreground text-sm">
            If you don&lsquo;t see it, check your spam folder.
          </p>
          <p className="text-muted-foreground text-sm mt-3">
            Go back to <Button variant={"link"} className="p-0" onClick={ () => setEmailSent(false) }>Sign in</Button>
          </p>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="sm:mx-auto sm:w-full sm:max-w-sm" data-testid="magic-login-form">
      <h2 className="mt-5 text-center text-2xl font-bold leading-9 tracking-tight">
        Sign in to your account
      </h2>
      <Form {...form}>
        <form className="block space-y-6 mt-10" method="POST" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block text-sm font-medium leading-6 mb-3">Email address</FormLabel>
                <FormControl>
                  <input
                    id="email"
                    {...field}
                    placeholder="john.doe@example.com"
                    type="email"
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
          <div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-indigo-500 px-3 py-1.5 text-sm font-semibold leading-6 shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
            >
              Login with Email
            </button>
          </div>
        </form>
      </Form>
    </div>

  );
}