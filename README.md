# Bakabit Portal

Bakabit Portal is a comprehensive user management platform designed to facilitate task management, calendar scheduling, and personal productivity enhancements. Built with the latest technology stack, this portal aims to provide a seamless experience for managing todos, calendars, and integrating GPT function calls for enhanced user interactions.

## Tech Stack

The project leverages a modern tech stack for optimal performance and scalability:

- **Frontend Framework**: Next.js (^14.1.0)
- **UI Components**: Headless UI, Radix UI, Heroicons, Lucide React
- **Form Handling**: React Hook Form, @hookform/resolvers
- **State Management**: Built-in Next.js capabilities, Context API
- **Styling**: Tailwind CSS, SASS, Tailwind Merge, Tailwindcss Animate
- **Backend**: Prisma (5.10.2) as the ORM
- **Database**: PostgreSQL (Managed Database)
- **Deployment**: [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme)
- **Email Service**: AWS SES
- **Authentication**: Custom implementation for enhanced security
- **Additional Libraries**: date-fns for date handling, jsonwebtoken for JWT based auth, uuid for generating unique identifiers, zod


## Features

- [x] **User Management**: Manual authentication system for better security and privacy.
- [x] **Task Management**: Intuitive interface to manage your tasks efficiently.
- [ ] **Calendar Scheduling**: Integrated calendar for easy scheduling and event management, powered by Google Calendar API.
- [x] **GPT Integration**: Leverage GPT function calls for enhanced productivity tools.
- [ ] **Email Integration**: Manage and send emails directly through the platform, utilizing the Gmail API.
- [ ] **Contacts Management**: Access and manage your contacts, leveraging Google Contacts API for seamless integration.
- [ ] **File Management**: Store, access, and manage files with Google Drive API integration, ensuring secure and organized file handling.
- [ ] **Data Analysis and Reporting**: Utilize Google Sheets API for advanced data analysis and reporting capabilities within your workflows.
- [ ] **Rich Communication Features**: Enhance user engagement with personalized email and notification services through Gmail API.
- [ ] **Comprehensive Contact Insights**: Gain deeper insights into your contacts, improve networking and relationships using the People API.
- [ ] **Advanced Task Automation**: Implement sophisticated task management and automation using GPT integration combined with Google Tasks.
- [ ] **Enhanced Search Capabilities**: Future integration with a Postgres vector database will provide advanced search features, making it easier to retrieve relevant information and documents quickly.
- [ ] **Intelligent Data Embedding**: Utilize the Postgres vector database for embedding data intelligently, enabling more efficient data retrieval and analysis.
- [ ] **Personalized Content Recommendations**: With GPT integration and Postgres vector database, offer personalized content and task recommendations based on user behavior and preferences.
- [ ] **Semantic Search in Emails and Documents**: Implement semantic search across emails and documents stored in Google Drive, enhancing the ability to find relevant information effortlessly.


## Getting Started

### Prerequisites
- Node.js (version 18 or later)
- pnpm, npm or yarn
- PostgreSQL database

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/chozzz/bakabit-portal.git
   cd bakabit-portal
   ```

2. **Install dependencies:**

   ```bash
   pnpm install
   # or, if you're using npm
   npm install
   # or, if you're using yarn
   yarn install
   ```

3. **Set up your environment variables:**

   Copy the `.env.example` file to a new file named `.env.local` and fill in your database connection details and any other environment variables required.


## Environment Variables

The Bakabit Portal utilizes several environment variables for its configuration. You will need to set these up in your `.env.local` file. Here's a guide to the required environment variables:

### Database Setup with Prisma

To understand how to play around with Prisma, view the [Prisma readme](https://github.com/chozzz/bakabit-portal/tree/main/prisma)

1. Configure your database connection:

   Ensure your `.env.local` file includes the database connection string for your PostgreSQL database:

   ```bash
   DATABASE_URL="postgresql://user:password@localhost:5432/mydatabase?schema=public"
   ```

2. Run Prisma migrations:

   To set up your database schema or apply any updates, run the Prisma migration command:

   ```bash
   npx prisma migrate dev
   ```

   This command creates the tables in your database according to the schema defined in **prisma/schema.prisma**.

3. Generate Prisma client:

   Generate the Prisma client to interact with your database:

   ```bash
   npx prisma generate
   ```
   
### JWT Configuration Setup

To securely manage user sessions and authentication, Bakabit Portal utilizes JSON Web Tokens (JWT). You must generate a secure JWT secret for your application:

- `JWT_SECRET`: A secret key used for signing JWT tokens. Ensure this is a long, random string to maintain security.

You can use OpenSSL to generate a secure secret:
```bash
openssl rand -base64 48
```
   
### AWS SES Configuration

These variables are required for integrating Amazon Simple Email Service (SES) for sending emails:

- `AWS_SES_REGION`: The AWS region where your SES instance is located, e.g., `us-east-1`.
- `AWS_SES_ACCESS_KEY`: Your AWS access key ID for SES.
- `AWS_SES_SECRET`: Your AWS secret access key for SES.
- `AWS_SES_MAIL_FROM`: The email address used as the sender in emails sent from the portal. This email must be verified with Amazon SES.

For more detailed instructions and additional configurations, refer to the [Amazon SES Documentation](https://docs.aws.amazon.com/ses/).

---

## Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Contributing

We welcome contributions to the Bakabit Portal! Whether it's bug reports, feature requests, or contributions to code, please feel free to make a pull request or open an issue.

## License

Bakabit Portal is open source software licensed as [MIT](https://choosealicense.com/licenses/mit/).


## Learn More

To further enhance your development with Bakabit Portal, explore the documentation and resources of the key technologies and libraries used in the project:

- [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - An interactive Next.js tutorial.
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) - Learn how to style your apps without leaving your HTML with Tailwind CSS.
- [Prisma Documentation](https://www.prisma.io/docs) - Explore the comprehensive guide to using Prisma ORM for database management.
- [React Hook Form Documentation](https://react-hook-form.com/) - Learn about efficient form handling in React applications.
- [Zod GitHub Repository](https://github.com/colinhacks/zod) - Discover Zod, a TypeScript-first schema validation library.
- [AWS SES Documentation](https://docs.aws.amazon.com/ses/latest/dg/welcome.html) - Get started with Amazon Simple Email Service for email sending.
- [jsonwebtoken GitHub Repository](https://github.com/auth0/node-jsonwebtoken) - Learn about creating and verifying JWTs with this popular library.

## Deploy on Vercel

The easiest way to deploy Bakabit is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
