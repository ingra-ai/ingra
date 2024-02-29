"use client";

import * as z from "zod";
import { TaskSchema, TaskStatus, TaskPriority } from "@/schemas/task";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createTask, updateTask } from "@app/(protected)/tasks/actions";
import {
  Form,
  FormField,
  FormControl,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { useCallback, useState } from "react";
import { Logger } from "@lib/logger";
import { useToast } from "@components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@components/ui/button";

export const TaskForm: React.FC = () => {
  const { toast } = useToast();
  // const [isEmailSent, setEmailSent] = useState(false);

  const form = useForm<z.infer<typeof TaskSchema>>({
    resolver: zodResolver(TaskSchema),
    defaultValues: {
      title: "",
      description: "",
      status: TaskStatus.enum.TODO,
      priority: TaskPriority.enum.MEDIUM
    }
  });

  const onSubmit = useCallback((values: z.infer<typeof TaskSchema>) => {
    createTask(values).then((data) => {
      toast({
        title: "Task created!",
        description: "Task has been created successfully.",
      });
      form.reset();
    }).catch((error: Error) => {
      toast({
        title: "Uh oh! Something went wrong.",
        description: error?.message || "Failed to perform task operation",
      });

      Logger.error(error?.message);
    });
  }, []);

  return (
    <div className="sm:mx-auto sm:w-full sm:max-w-sm md:max-w-xl lg:max-w-2xl" data-testid="magic-login-form">
      <h2 className="mt-5 text-center text-2xl font-bold leading-9 tracking-tight">
        Create a new task
      </h2>
      <Form {...form}>
        <form className="block space-y-6 mt-10" method="POST" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="">
                <FormLabel className="block text-sm font-medium leading-6 mb-3">Title</FormLabel>
                <FormControl>
                  <input
                    id="title"
                    {...field}
                    placeholder="Enter a title"
                    type="text"
                    autoComplete=""
                    required
                    autoFocus
                    className="block w-full rounded-md border-0 bg-white/5 py-2 px-2 shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="">
                <FormLabel className="block text-sm font-medium leading-6 mb-3">Description</FormLabel>
                <FormControl>
                  <textarea
                    id="description"
                    {...field}
                    placeholder="Enter a description"
                    autoComplete=""
                    required
                    autoFocus
                    className="block w-full rounded-md border-0 bg-white/5 py-2 px-2 shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(TaskPriority.parse(value))}
                      defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(TaskPriority.enum).map(([key, value]) => (
                          <SelectItem key={key} value={key}>
                            {value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>
            <div className="sm:col-span-3">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(TaskStatus.parse(value))}
                      defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(TaskStatus.enum).map(([key, value]) => (
                          <SelectItem key={key} value={key}>
                            {value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="grid py-8 grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-2"></div>
            <div className="sm:col-span-2"></div>
            <div className="sm:col-span-2">
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-indigo-500 px-3 py-1.5 text-sm font-semibold leading-6 shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
              >
                Add New
              </button>
            </div>
          </div>
        </form>
      </Form>
    </div>

  );
}