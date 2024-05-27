# Bakabit Portal

Bakabit Portal is designed to help you curate and manage functions or workflows that can be used to create your own personal assistant suite tailored to your needs.
Our goal is to make these functions freely available for everyone, enabling a community-driven approach to personal assistant development.

It's available to review at [https://portal.bakabit.com](https://portal.bakabit.com) with your browser to see the result.

#### Getting Started as a new User
1. Login and visit [Marketplace](https://portal.bakabit.com/functions/marketplace) and find some useful community-functions for you to Subscribe or Fork.
2. Visit [Overview](https://portal.bakabit.com/overview), Review the notification alert and you may find links to your **openapi.json** for your GPT actions or **Swagger** to test it on the web.
3. Generate API key at [https://portal.bakabit.com/settings/api](https://portal.bakabit.com/settings/api) for `x-api-key` header when configuring your ChatGPT actions
4. Paste JSON from **openapi.json** to your own chatgpt plugins actions.
5. Interact with your personalized GPT hooked with the functions you have.

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
- [ ] **Workflows Hub**: Integrate react-flow to curate one or more functions for more comprehensive task.
- [ ] **User Onboarding**: Streamlined onboarding process to help new users get started quickly and efficiently, including step-by-step guides and support resources.
- [ ] **Advanced Security Features**: Implement advanced security measures such as encryption, secure access controls, and more to protect user data and function integrity.
- [ ] **Collaboration Tools**: Develop tools to facilitate collaboration among users and developers, such as version control, code reviews, and more.
- [ ] **Personalization Options**: Offer advanced personalization options to tailor the assistant’s behavior and responses to individual preferences.
- [ ] **AI and Machine Learning Integration**: Incorporate AI and ML models to enhance the capabilities of your personal assistant, allowing for more intelligent and responsive interactions.
- [ ] **AI Agent Creation**: Incorporate AI Agent creation for specific comprehensive task.
- [ ] **Cron Features**: Integrate scheduled run for certain function, that will feed to users. Either by web, email or to their own AI Agent.
- [ ] **Natural Language Processing**: Improve interaction with natural language understanding and processing, making the assistant more intuitive and user-friendly.


## Getting Started

### Prerequisites
- Node.js (version 18 or later)
- pnpm, npm or yarn
- PostgreSQL database

#### Prerequisites, but will be made optional
- (optional) AWS SES Key - to send authentication email for signing in
- (optional) Google OAuth - Some functions require Google access token to run
- (optional) [Vercel KV](https://vercel.com/docs/storage/vercel-kv) - For faster auth session interactions

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

## Authentication

We're just using [Magic Link AUTH](https://owasp.org/www-chapter-vancouver/assets/presentations/2020-08_The_Evolution_of_Authentication.pdf) to authenticate user.

Therefore, the following configuration is needed

#### JWT Configuration Setup

To securely manage user sessions and authentication, Bakabit Portal utilizes JSON Web Tokens (JWT). You must generate a secure JWT secret for your application:

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
