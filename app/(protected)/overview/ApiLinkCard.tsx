import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@lib/utils";

interface ApiLinkCardProps {
  url: string;
  title: string;
  description: string;
  body: string;
  className?: string;
}

export const ApiLinkCard: React.FC<ApiLinkCardProps> = ({ url, title, description, body, className }) => {
  return (
    <a
      href={url}
      target="_blank"
      aria-label={ title }
      className={cn(className)}
    >
      <Card className="hover:border-gray-500" title={title}>
        <CardHeader>
          <CardTitle className="flex justify-between">
            <h3 className="text-sm">{title}</h3>
            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-500">
              <span className="sr-only">Online</span>
              <svg
                className="h-4 w-4 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1.8-5.6a1 1 0 011.4 1.4L7.4 16.2a1 1 0 11-1.4-1.4l3.2-3.2zM10 5.5a1 1 0 100 2 1 1 0 000-2z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
          </CardTitle>
          <CardDescription>
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm">
          { body }
        </CardContent>
      </Card>
    </a>
  );
};