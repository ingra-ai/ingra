# Database
### Prisma Knowledge Base

Welcome to the Prisma Knowledge Base! This guide provides an overview of the most common commands you'll need to use when working with Prisma, an open-source database toolkit. Prisma helps you easily manage your database schema and interact with your data through an auto-generated and type-safe query builder.

## Learning References

## Getting Started

Before diving into the commands, make sure you have Prisma installed in your project. If not, you can add it by running:

```bash
npm install prisma --save-dev
npm install @prisma/client
```

And then initialize Prisma in your project:

```bash
npx prisma init
```

This command creates a new prisma directory with a schema.prisma file where you define your database models.

### Common Prisma Commands

1. **prisma migrate dev**

   This command is used to create a new migration file based on changes in your schema.prisma file, apply the migration to update your database schema, and generate or update the Prisma Client to match the new schema.

   ```bash
   npx prisma migrate dev
   ```

2. **prisma db push**

   prisma db push is used in the development environment to quickly update the database schema without creating migration files. It's ideal for rapid prototyping.

   ```bash
   npx prisma db push
   ```

3. **prisma migrate reset**

   Resets your database by dropping all data and tables, then applies all migrations from scratch. This command is useful during development to start with a fresh database.

   ```bash
   npx prisma migrate reset
   ```

4. **prisma studio**

   Prisma Studio provides a visual interface for your database. You can view and edit data in your database using this tool.

   ```bash
   npx prisma studio
   ```

5. **prisma generate**

   Generates the Prisma Client code which you can use to interact with your database programmatically. This command is automatically invoked by prisma migrate dev, but you can run it manually if needed.

   ```bash
   npx prisma generate
   ```

### Further Reading

For more detailed information and advanced usage, refer to;

1. [Prisma Github](https://github.com/prisma/prisma)
2. [Prisma Documentation](https://www.prisma.io/docs/)

## Community

Prisma has a large and supportive [community](https://www.prisma.io/community) of enthusiastic application developers. You can join us on [Slack](https://slack.prisma.io), [Discord](https://pris.ly/discord), and here on [GitHub](https://github.com/prisma/prisma/discussions).

## Security

If you have a security issue to report, please contact us at [security@prisma.io](mailto:security@prisma.io?subject=[GitHub]%20Prisma%202%20Security%20Report%20).

## Support

### Ask a question about Prisma

You can ask questions and initiate [discussions](https://github.com/prisma/prisma/discussions/) about Prisma-related topics in the `prisma` repository on GitHub.

👉 [**Ask a question**](https://github.com/prisma/prisma/discussions/new)

### Create a bug report for Prisma

If you see an error message or run into an issue, please make sure to create a bug report! You can find [best practices for creating bug reports](https://www.prisma.io/docs/guides/other/troubleshooting-orm/creating-bug-reports) (like including additional debugging output) in the docs.

👉 [**Create bug report**](https://pris.ly/prisma-prisma-bug-report)

### Submit a feature request

If Prisma currently doesn't have a certain feature, be sure to check out the [roadmap](https://www.prisma.io/docs/more/roadmap) to see if this is already planned for the future.

If the feature on the roadmap is linked to a GitHub issue, please make sure to leave a 👍 reaction on the issue and ideally a comment with your thoughts about the feature!

👉 [**Submit feature request**](https://github.com/prisma/prisma/issues/new?assignees=&labels=&template=feature_request.md&title=)
