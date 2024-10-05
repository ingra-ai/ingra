import Link from 'next/link';
import { Button } from "@repo/components/ui/button";
import { Home } from 'lucide-react';
import Interstellar404 from '@repo/components/not-found/Interstellar404';

export default function NotFoundPage() {

  return (
    <div className="relative" data-testid="page-not-found">
      <Interstellar404 />
      <div className="fixed top-0 left-0 right-0 bottom-0 flex flex-col items-center justify-center p-4 overflow-hidden">
        <Link href="/">
          <Button variant="outline" size={'lg'} className="border-blue-500 text-blue-400 hover:bg-blue-900 mt-[300px]">
            <Home className="mr-2 h-4 w-4" />
            Return to Main Interface
          </Button>
        </Link>
      </div>
    </div>
  )
}