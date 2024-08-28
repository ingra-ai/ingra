import { getUserRepoCollectionsUri } from "@repo/shared/lib/constants/repo";
import { RedirectType, notFound, redirect } from "next/navigation";

export default async function Page({
  searchParams,
  params,
}: {
  searchParams: Record<string, string | string[] | undefined>;
  params: { ownerUsername: string };
}) {
  const { ownerUsername } = params;

  if (ownerUsername) {
    return redirect(
      getUserRepoCollectionsUri(ownerUsername),
      RedirectType.replace,
    );
  } else {
    return notFound();
  }
}
