"use client";

import * as z from "zod";
import { MagicLoginSchema } from "@/schemas/auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { magicLoginEmail } from "@app/auth/actions/login";
import { useState } from "react";
import { Logger } from "@lib/logger";
import { useToast } from "@components/ui/use-toast";
import { Button } from "@components/ui/button";
import { RefreshCcw } from "lucide-react"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@components/ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";

type FormViewState = "email" | "otp" | "redirect";
type MagicLoginFormProps = {};

export const MagicLoginForm: React.FC<MagicLoginFormProps> = (props) => {
  const { toast } = useToast();
  const [formView, setFormView] = useState<FormViewState>("email");
  const [isLoading, setIsLoading] = useState(false);

  const { handleSubmit, register, formState, setValue, reset } = useForm<z.infer<typeof MagicLoginSchema>>({
    resolver: zodResolver(MagicLoginSchema),
    defaultValues: {
      email: "",
      otpCode: ""
    }
  });

  const doMagicLogin = async (values: z.infer<typeof MagicLoginSchema>) => {
    setIsLoading(true);

    const hasOtp = values.otpCode,
      hasEmail = values.email;

    if ( hasOtp && hasEmail && formView === 'otp' ) {
      setFormView('redirect');
    }

    return magicLoginEmail(values).then((data) => {
      if ( !hasOtp && hasEmail && data?.success) {
        setFormView('otp');
        return;
      }
    }).catch((error: Error) => {
      toast({
        title: "Uh oh! Something went wrong.",
        description: error?.message || "Please try again!",
      });

      setFormView('email');
      reset();
      Logger.error(error?.message);
    })
      .finally(() => {
        setIsLoading(false);
      });
  }

  const onOtpInputChange = (newValue: string) => {
    setValue('otpCode', newValue, { shouldValidate: true });
  };

  if (formView === 'redirect') {
    return (
      <div className="sm:mx-auto sm:w-full sm:max-w-sm" data-testid="magic-login-form">
        <h2 className="mt-5 text-center text-2xl font-bold leading-9 tracking-tight">
          Signing You In
        </h2>
        <div className='flex space-x-2 justify-center items-center my-10'>
          <span className='sr-only'>Loading...</span>
          <div className='h-4 w-4 bg-slate-200 rounded-full animate-bounce [animation-delay:-0.3s]'></div>
          <div className='h-4 w-4 bg-slate-200 rounded-full animate-bounce [animation-delay:-0.15s]'></div>
          <div className='h-4 w-4 bg-slate-200 rounded-full animate-bounce'></div>
        </div>
        <p className="my-5 text-center text-sm text-white/70 max-w leading-6">
          Please hold on a moment. We&lsquo;re currently working on signing you into your account. This should only take a few seconds. If it&lsquo;s taking longer than expected, please <Button variant={"link"} className="p-0" onClick={() => setFormView('email')}>try signing in again</Button>
        </p>
      </div>
    );
  }

  return (
    <div className="sm:mx-auto sm:w-full sm:max-w-sm" data-testid="magic-login-form">
      {
        formView === 'email' ? (
          <>
            <h2 className="mt-5 text-center text-2xl font-bold leading-9 tracking-tight">
              Enter your email address
            </h2>
            <p className="mt-2 text-center text-sm text-white/70 max-w">
              We will send you a magic link and one-time password to your email address.
            </p>
          </>
        ) : (
          <>
            <h2 className="mt-5 text-center text-2xl font-bold leading-9 tracking-tight">
              Check your email for the one-time password
            </h2>
            <p className="mt-2 text-center text-sm text-white/70 max-w">
              We’ve sent a 6-character code to your email address. The code expires shortly, so please enter it soon.
            </p>
          </>
        )
      }
      <form className="block space-y-6 mt-10" method="POST" onSubmit={handleSubmit(doMagicLogin)}>
        {
          formView === 'email' ? (
            <div>
              <label htmlFor="email" className="block text-sm font-medium leading-6 mb-3">Email address</label>
              <input
                id="email"
                {...register("email")}
                placeholder="john.doe@example.com"
                type="text"
                autoComplete="email-bakabit"
                required
                autoFocus
                className="block w-full rounded-md border-0 bg-white/5 py-2 px-4 shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-10"
              />
              {
                formState.errors.email && (
                  <p className="text-sm font-medium text-destructive-foreground mt-3 text-center">{formState.errors.email.message}</p>
                )
              }
            </div>
          ) : (
            <div>
              <InputOTP
                onComplete={handleSubmit(doMagicLogin)}
                onChange={onOtpInputChange}
                textAlign="center"
                maxLength={6}
                pattern={REGEXP_ONLY_DIGITS}
                autoComplete="otp-code-bakabit"
                render={({ slots }) => (
                  <InputOTPGroup className="mx-auto">
                    {slots.map((slot, index) => (
                      <InputOTPSlot key={index} className="rounded-md border text-xl mx-1 h-10 w-10 xl:h-15 xl:w-15 xl:mx-2 bg-slate-900" {...slot} />
                    ))}{" "}
                  </InputOTPGroup>
                )}
              />
              {
                formState.errors.otpCode && (
                  <p className="text-sm font-medium text-destructive-foreground mt-3 text-center">{formState.errors.otpCode.message}</p>
                )
              }
            </div>
          )
        }
        <div className="block">
          {
            formView === 'email' ? (
              <Button
                variant={'default'}
                type='submit'
                disabled={isLoading}
                className="flex w-full justify-center rounded-md px-3 py-1.5 text-sm font-semibold leading-8 shadow-sm"
              >
                {isLoading && <RefreshCcw className="animate-spin inline-block mr-2" />}
                {isLoading ? 'Working on it...' : 'Continue'}
              </Button>
            ) : (
              <>
                <p className="text-muted-foreground text-xs text-center">
                  Can’t find your code? Check your spam folder!
                </p>
                <p className="text-muted-foreground text-xs mt-1 text-center">
                  Or, you can try to <Button variant={"link"} className="p-0" onClick={() => setFormView('email')}>sign in again</Button>
                </p>
              </>
            )
          }
        </div>
      </form>
    </div>
  );
}
