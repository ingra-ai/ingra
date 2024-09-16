# Ingra

Ingra is an open-source platform designed to enrich developer experience to curate and hook AI function tool calling capabilities.
Seamlessly integrate to any LLMs by providing capabilities to curate, manage, and host functions that can be used to create your own personal assistant suite tailored to your needs.

Our goal is to make these tool freely available for everyone, and enabling a community-driven approach to personal assistant development.

## What's Inside?

This repository is organized as a Turborepo, containing multiple applications and packages:

## Documentation

Visit [Ingra Documentation](https://docs.ingra.ai) to view the full documentation.

### Applications

- **`hubs`**: FS - Next.js application serving UI for hubs interface and serving LLM api calls for collections and functions.
- **`auth`**: FE - Next.js application serving auth UI.
- **`docs`**: Another Next.js application for documentation purposes.

### Packages

- **`@repo/components`**: A React component library shared across applications.
- **`@repo/shared`**: Utilities library shared across applications.
- **`@repo/db`**: Database schema utilizes Prisma
- **`@repo/eslint-config`**: Shared ESLint configurations.
- **`@repo/typescript-config`**: TypeScript configurations used throughout the monorepo.

## Tech Stack

The project leverages a modern tech stack for optimal performance and scalability:

- **Frontend Framework**: Next.js (^14.1.0)
- **UI Components**: Headless UI, Radix UI, Heroicons, Lucide React
- **Form Handling**: React Hook Form, @hookform/resolvers
- **State Management**: Built-in Next.js capabilities, Context API
- **Styling**: Tailwind CSS, SASS, Tailwind Merge, Tailwindcss Animate
- **Backend**: Prisma (5.10.2) as the ORM
- **Database**: PostgreSQL (Prisma)
- **Deployment**: [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme)
- **Email Service**: AWS SES
- **Authentication**: Custom built-in implementation without using any 3rd party for enhanced security
- **Additional Libraries**: date-fns for date handling, jsonwebtoken for JWT based auth, uuid for generating unique identifiers, zod for forms validation, chrono-node for natural date-time parsing.

## Features

- [x] **Functions Hub**: Curate a variety of functions that can be integrated into your personal assistant suite. The hub serves as a central repository for all available functions.
- [x] **Auto-Generated OpenAPI and Swagger Specs**: Automatically generate OpenAPI and Swagger specifications for your curated functions, ensuring standardized documentation and ease of use.
- [x] **Virtual Machine Execution**: All functions run in a secure virtual machine environment, providing isolation and security.
- [x] **Privacy Controls**: Provide users with granular privacy controls to manage their data and interactions, ensuring transparency and trust.
- [x] **Integration to OpenAI ChatGPT Plugin**: Provide seamless experience to integrate personal curated functions to ChatGPT Plugin
- [x] **Function Marketplace**: A marketplace where users can share, rate, and review functions, enhancing discoverability and quality.
  - Screw it, good enough for now - ill be back later.
- [x] **Self Function Generation**: Provide an API endpoint for user to curate their own functions by using GPT.
- [ ] **Chat**: Provides built-in AI Assistant utilizing LangChain to converse and interact with tools calling. Has Cron.
- [ ] **Self Hosting**: An option to switch database endpoint, or running local LLMs. This should help users flexibly to host their own data. Configurables would be psql, redis, pinecone and aws ses setup. (google oauth or openai api key are overridable from env variables built-in)
- [ ]
- [ ] **Workflows Hub**: Integrate react-flow to curate one or more functions for more comprehensive task.
- [ ] **User Onboarding**: Streamlined onboarding process to help new users get started quickly and efficiently, including step-by-step guides and support resources.
- [ ] **Advanced Security Features**: Implement advanced security measures such as encryption, secure access controls, and more to protect user data and function integrity.
- [ ] **Collaboration Tools**: Develop tools to facilitate collaboration among users and developers, such as version control, code reviews, and more.
- [ ] **Personalization Options**: Offer advanced personalization options to tailor the assistant’s behavior and responses to individual preferences.

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/ingra-ai/ingra-hubs
   cd ingra-hubs
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

   ```bash
   cp .env.example apps/hubs/.env
   cp .env.example apps/docs/.env
   cp .env.example apps/auth/.env
   ```

   Copy the `.env.example` file to a new file named `./apps/hubs/.env` and fill in your database connection details and any other environment variables required.

## Environment Variables

The Ingra Hubs utilizes several environment variables for its configuration. You will need to set these up in your `.env` file. Here's a guide to the required environment variables:

### Database Setup with Prisma

To understand how to play around with Prisma, view the [Prisma readme](https://github.com/ingra-ai/ingra-hubs/tree/main/prisma)

1. Configure your database connection:

   Ensure your `.env` file includes the database connection string for your PostgreSQL database:

   ```bash
   DATABASE_URL="postgresql://user:password@localhost:5432/mydatabase?schema=public"
   ```

2. Run Prisma migrations:

   To set up your database schema or apply any updates, run the Prisma migration command:

   ```bash
   pnpm db:migrate:dev
   ```

   This command creates the tables in your database according to the schema defined in **prisma/schema.prisma**.

3. Generate Prisma client:

   Generate the Prisma client to interact with your database:

   ```bash
   pnpm db:generate
   ```

## Authentication

We're just using [Magic Link AUTH](https://owasp.org/www-chapter-vancouver/assets/presentations/2020-08_The_Evolution_of_Authentication.pdf) to authenticate user.

Therefore, the following configuration is needed

#### JWT Configuration Setup

To securely manage user sessions and authentication, Ingra Hubs utilizes JSON Web Tokens (JWT). You must generate a secure JWT secret for your application:

- `JWT_SECRET`: A secret key used for signing JWT tokens. Ensure this is a long, random string to maintain security.

You can use OpenSSL to generate a secure secret:

```bash
openssl rand -base64 48
```

#### Setup AWS SES Configuration

These variables are required for integrating Amazon Simple Email Service (SES) for sending emails:

- `AWS_SES_REGION`: The AWS region where your SES instance is located, e.g., `us-east-1`.
- `AWS_SES_ACCESS_KEY`: Your AWS access key ID for SES.
- `AWS_SES_SECRET`: Your AWS secret access key for SES.
- `AWS_SES_MAIL_FROM`: The email address used as the sender in emails sent from the portal. This email must be verified with Amazon SES.

For more detailed instructions and additional configurations, refer to the [Amazon SES Documentation](https://docs.aws.amazon.com/ses/).

---

## Running the Development Server

```bash
pnpm dev
```

### Turborepo Remote Caching

Turborepo can use a technique known as [Remote Caching](https://turbo.build/repo/docs/core-concepts/remote-caching) to share cache artifacts across machines, enabling you to share build caches with your team and CI/CD pipelines.

By default, Turborepo will cache locally. To enable Remote Caching you will need an account with Vercel. If you don't have an account you can [create one](https://vercel.com/signup), then enter the following commands:

```
cd my-turborepo
npx turbo login
```

This will authenticate the Turborepo CLI with your [Vercel account](https://vercel.com/docs/concepts/personal-accounts/overview).

Next, you can link your Turborepo to your Remote Cache by running the following command from the root of your Turborepo:

```
npx turbo link
```

## Contributing

We welcome contributions to the Ingra Hubs! Whether it's bug reports, feature requests, or contributions to code, please feel free to make a pull request or open an issue. Thanks in advance

## License

Ingra Hubs is open source software licensed as [MIT](https://choosealicense.com/licenses/mit/).

## Learn More

To further enhance your development with Ingra Hubs, explore the documentation and resources of the key technologies and libraries used in the project:

- [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - An interactive Next.js tutorial.
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) - Learn how to style your apps without leaving your HTML with Tailwind CSS.
- [Prisma Documentation](https://www.prisma.io/docs) - Explore the comprehensive guide to using Prisma ORM for database management.
- [React Hook Form Documentation](https://react-hook-form.com/) - Learn about efficient form handling in React applications.
- [Zod GitHub Repository](https://github.com/colinhacks/zod) - Discover Zod, a TypeScript-first schema validation library.
- [AWS SES Documentation](https://docs.aws.amazon.com/ses/latest/dg/welcome.html) - Get started with Amazon Simple Email Service for email sending.
- [jsonwebtoken GitHub Repository](https://github.com/auth0/node-jsonwebtoken) - Learn about creating and verifying JWTs with this popular library.

### Turborepo Useful Links

Learn more about the power of Turborepo:

- [Tasks](https://turbo.build/repo/docs/core-concepts/monorepos/running-tasks)
- [Caching](https://turbo.build/repo/docs/core-concepts/caching)
- [Remote Caching](https://turbo.build/repo/docs/core-concepts/remote-caching)
- [Filtering](https://turbo.build/repo/docs/core-concepts/monorepos/filtering)
- [Configuration Options](https://turbo.build/repo/docs/reference/configuration)
- [CLI Usage](https://turbo.build/repo/docs/reference/command-line-reference)
