import { Logo } from "@repo/components/navs/navbar";
import { DOCS_APP_URL } from "@repo/shared/lib/constants";
import { motion } from "framer-motion";
import Link from "next/link";

export const Overview = () => {
  return (
    <motion.div
      key="overview"
      className="max-w-[500px] mt-20 mx-4 md:mx-0"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ delay: 0.5 }}
    >
      <div className="border rounded-lg p-6 flex flex-col gap-4 text-zinc-500 text-sm dark:text-zinc-400 dark:border-zinc-700">
        <p className="flex flex-row justify-center gap-4 items-center text-zinc-900 dark:text-zinc-50">
          <Logo />
          <span>Ingra Chat</span>
        </p>
        <p>
          Welcome to Ingra&apos;s AI-powered chatbot! This chatbot is designed to enhance your experience by providing instant assistance and information. It leverages the power of{" "}
          <Link
            className="text-blue-500 dark:text-blue-400"
            href="https://vercel.com/ai"
            target="_blank"
          >
            Vercel AI
          </Link>{" "}
          and{" "}
          <Link
            className="text-blue-500 dark:text-blue-400"
            href="https://js.langchain.com/docs/"
            target="_blank"
          >
            LangChain
          </Link>{" "}
          to deliver a seamless and intelligent conversation.
        </p>
        <p>
          Learn more about how Ingra is utilizing cutting-edge technology to serve you better by visiting our{" "}
          <Link
            className="text-blue-500 dark:text-blue-400"
            href={DOCS_APP_URL}
          >
            Documentation
          </Link>{" "}
          page.
        </p>
      </div>
    </motion.div>
  );
};
