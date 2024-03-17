import Link from 'next/link';
import { CSSProperties } from 'react';

export default async function Dashboard() {
  return (
    <div className="leading-7">
      <h1 className="text-lg">Setting up to use GPT Plugins</h1>
      <p>
        Go to your{' '}
        <Link className="underline font-medium" href="/settings/gpt-plugins" prefetch={true}>
          GPT Plugins Settings
        </Link>
      </p>
    </div>
  );
}
