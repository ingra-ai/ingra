import { RedirectType, redirect } from 'next/navigation';

export default async function Page(
  { searchParams, params }: {
    searchParams: Record<string, string | string[] | undefined>;
    params: { ownerUsername: string };
  }
) {
  const { ownerUsername } = params;
  redirect(`/repo/${ ownerUsername }/collections`, RedirectType.replace);
}
