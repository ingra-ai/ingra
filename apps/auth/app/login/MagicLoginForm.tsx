'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@repo/components/ui/button';
import { Input } from '@repo/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@repo/components/ui/input-otp';
import { useToast } from '@repo/components/ui/use-toast';
import { censorEmail, cn } from '@repo/shared/lib/utils';
import { MagicLoginSchema } from '@repo/shared/schemas/auth';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { RefreshCcw } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { magicLoginEmail } from '../(actions)/login';

import type { ChangeEvent, FC } from 'react';

export type FormViewState = 'email' | 'otp' | 'redirect';

type MagicLoginFormProps = {
  className?: string;
};

export const MagicLoginForm: FC<MagicLoginFormProps> = (props) => {
  const { className } = props;
  const { toast } = useToast();
  const [formView, setFormView] = useState<FormViewState>('email');
  const [isLoading, setIsLoading] = useState(false);

  const { handleSubmit, register, formState, setValue, reset, watch } = useForm<z.infer<typeof MagicLoginSchema>>({
    resolver: zodResolver(MagicLoginSchema),
    defaultValues: {
      email: '',
      otpCode: '',
    },
  });

  const doMagicLogin = async (values: z.infer<typeof MagicLoginSchema>) => {
    setIsLoading(true);

    const hasOtp = values.otpCode,
      hasEmail = values.email;

    if (hasOtp && hasEmail && formView === 'otp') {
      setFormView('redirect');
    }

    return magicLoginEmail(values)
      .then((result) => {
        if (result.status !== 'ok') {
          throw new Error(result.message);
        }

        if (!hasOtp && hasEmail) {
          setFormView('otp');
          return;
        }
      })
      .catch((error: Error) => {
        if (error?.message === 'NEXT_REDIRECT') {
          return;
        }

        toast({
          title: 'Uh oh! Something went wrong.',
          description: error?.message || 'Please try again!',
        });

        setFormView('email');
        reset();
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const onEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.target.value = e.target.value.toLowerCase();
    setValue('email', e.target.value.toLowerCase(), { shouldValidate: false });
  };

  const onOtpInputChange = (newValue: string) => {
    setValue('otpCode', newValue, { shouldValidate: true });
  };

  const classes = cn('sm:mx-auto sm:w-full sm:max-w-sm', className);

  if (formView === 'redirect') {
    return (
      <div className={classes} data-testid="magic-login-form">
        <h2 className="text-center text-sm font-bold leading-9 tracking-tight">Signing You In</h2>
        <div className="flex space-x-2 justify-center items-center my-10">
          <span className="sr-only">Loading...</span>
          <div className="h-4 w-4 dark:bg-slate-200 bg-slate-800 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="h-4 w-4 dark:bg-slate-200 bg-slate-800 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="h-4 w-4 dark:bg-slate-200 bg-slate-800 rounded-full animate-bounce"></div>
        </div>
        <p className="my-5 text-center text-sm dark:text-gray-200 text-gray-800 max-w leading-6">
          Please hold on a moment. We&lsquo;re currently working on signing you into your account. This should only take a few seconds. If it&lsquo;s taking longer than expected, please{' '}
          <Button variant={'link'} className="p-0" onClick={() => setFormView('email')}>
            try signing in again
          </Button>
        </p>
      </div>
    );
  }

  const [censoredUser, censoredEmail] = censorEmail(watch('email') || '');

  return (
    <div className={classes} data-testid="magic-login-form">
      {formView === 'email' ? (
        <p className="mt-2 text-center text-sm dark:text-gray-200 text-gray-800 max-w">To get started, we will need to send you a magic link and one-time password to your email address.</p>
      ) : (
        <>
          <h2 className="text-center text-sm font-bold leading-9 tracking-tight">Check your email for the one-time password</h2>
          <p className="mt-2 text-center text-sm dark:text-gray-200 text-gray-800 max-w">
            We’ve sent a 6-character code <strong>{censoredEmail}</strong>. The code expires shortly, so please enter it soon.
          </p>
        </>
      )}
      <form className="block space-y-6 mt-10" method="POST" onSubmit={handleSubmit(doMagicLogin)} autoComplete="off">
        {formView === 'email' ? (
          <div>
            <label htmlFor="email" className="block text-sm font-medium leading-6 mb-3">
              Email address
            </label>
            <Input
              id="email"
              {...register('email')}
              onChange={onEmailChange}
              placeholder="john.doe@example.com"
              type="text"
              autoComplete=""
              required
              autoFocus
              className="block w-full rounded-md border-0 py-2 px-4 shadow-sm sm:text-sm sm:leading-10"
            />
            {formState.errors.email && <p className="text-sm font-medium text-destructive mt-3 text-left">{formState.errors.email.message}</p>}
          </div>
        ) : (
          <div>
            <InputOTP
              onComplete={handleSubmit(doMagicLogin)}
              onChange={onOtpInputChange}
              textAlign="center"
              maxLength={6}
              pattern={REGEXP_ONLY_DIGITS}
              autoComplete=""
              render={({ slots }) => (
                <InputOTPGroup className="mx-auto">
                  {slots.map((slot, index) => (
                    <InputOTPSlot key={index} className="rounded-md border text-xl mx-1 h-10 w-10 xl:h-15 xl:w-15 xl:mx-2" {...slot} />
                  ))}{' '}
                </InputOTPGroup>
              )}
            />
            {formState.errors.otpCode && <p className="text-sm font-medium text-destructive mt-3 text-center">{formState.errors.otpCode.message}</p>}
          </div>
        )}
        <div className="block">
          {formView === 'email' ? (
            <Button variant={'default'} type="submit" disabled={isLoading} className="flex w-full justify-center rounded-md px-3 py-1.5 text-sm font-semibold leading-8 shadow-sm">
              {isLoading && <RefreshCcw className="animate-spin inline-block mr-2" />}
              {isLoading ? 'Working on it...' : 'Continue'}
            </Button>
          ) : (
            <>
              <p className="text-muted-foreground text-xs text-center">Can’t find your code? Check your spam folder!</p>
              <p className="text-muted-foreground text-xs mt-1 text-center">
                Or, you can try to{' '}
                <Button variant={'link'} className="p-0" onClick={() => setFormView('email')}>
                  sign in again
                </Button>
              </p>
            </>
          )}
        </div>
      </form>
    </div>
  );
};
