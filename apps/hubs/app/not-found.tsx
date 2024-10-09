export default function NotFoundPage() {
  return (
    <div className={`relative flex min-h-screen flex-col items-center justify-center bg-gray-100 dark:bg-gray-900`} data-testid="page-not-found">
      <div className="flex items-center space-x-4 text-gray-800 dark:text-gray-200">
        <span className="text-4xl font-bold">404</span>
        <span className="text-4xl font-light">|</span>
        <span className="text-lg">Page Not Found</span>
      </div>
    </div>
  )
}