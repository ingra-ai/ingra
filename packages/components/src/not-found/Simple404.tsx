'use client';

export default function Simple404() {
  return (
    <div className={`relative flex min-h-screen flex-col items-center justify-center bg-gray-100 dark:bg-gray-900`} data-testid="page-not-found">
      <div className="flex items-center space-x-5 text-gray-800 dark:text-gray-200">
        <span className="text-2xl font-light">404</span>
        <span className="text-4xl font-extralight">|</span>
        <span className="text-xl font-light">Page Not Found</span>
      </div>
    </div>
  )
}