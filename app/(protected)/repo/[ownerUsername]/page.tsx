import { RedirectType, redirect } from 'next/navigation';

type ThisPageParams = {
  params: {
    ownerUsername: string;
  }
};

export default async function Page({ params }: ThisPageParams) {
  console.log({ params })
  return (
    <></>
  )
}
