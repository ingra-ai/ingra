import type { FC } from 'react';
import Link from 'next/link';

const NotFoundPage: FC = () => {
  return (
    <div className="h-screen w-full flex flex-col justify-center items-center bg-[#1A2238]">
      <h1 className="text-9xl font-extrabold text-[#d7cfcf] tracking-widest">404</h1>
      <p className="md:text-lg lg:text-xl text-[#d7cfcf] my-4">Sorry, we couldn’t find the page you’re looking for.</p>
      <button className="mt-5">
        <span className="relative inline-block text-sm font-medium text-[#d7cfcf] group active:text-orange-500 focus:outline-none focus:ring">
          <span className="absolute inset-0 transition-transform translate-x-0.5 translate-y-0.5 bg-[#d7cfcf] group-hover:translate-y-0 group-hover:translate-x-0"></span>

          <span className="relative block px-8 py-3 bg-[#1A2238] border border-current">
            <Link href="/">Go Home</Link>
          </span>
        </span>
      </button>
    </div>
  );
};

export default NotFoundPage;
