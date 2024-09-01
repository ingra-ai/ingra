'use server';
import { RedirectType, redirect } from 'next/navigation';

export default async function Page(props: { searchParams: Record<string, string | string[] | undefined> }) {
  redirect('/marketplace/collections', RedirectType.replace);
}
