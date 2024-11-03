"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@repo/components/ui/alert-dialog";
import { Button } from "@repo/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/components/ui/form";
import { Input } from "@repo/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/components/ui/select";
import { Slider } from "@repo/components/ui/slider";
import { Textarea } from "@repo/components/ui/textarea";
import { toast } from "@repo/components/ui/use-toast";
import { deleteChatConfig, listChatConfigs, upsertChatConfig } from "@repo/shared/actions/chatConfig";
import { CHAT_DEFAULT_CONFIG, ChatConfigSchema } from "@repo/shared/schemas/chatConfig";
import { Loader2, Trash2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";

const SEARCH_PARAMS_KEY = 'config';

// Define the structure of our LLM config
type ChatConfig = z.infer<typeof ChatConfigSchema>;

type ConfigFormState = {
  loading: boolean;
  isCreatingNew: boolean;
  configurations: ChatConfig[];
  selectedConfig: ChatConfig | null;
}

type ChatConfigFormProps = {
  className?: string;
};

// Main component
export default function ChatConfigForm({ className }: ChatConfigFormProps) {
  const [configFormState, setConfigFormState] = useState<ConfigFormState>({
    loading: false,
    isCreatingNew: false,
    configurations: [],
    selectedConfig: null,
  })
  const router = useRouter()
  const searchParams = useSearchParams()
  const configKey = searchParams.get(SEARCH_PARAMS_KEY)

  const form = useForm<z.infer<typeof ChatConfigSchema>>({
    defaultValues: configFormState.selectedConfig || CHAT_DEFAULT_CONFIG,
    resolver: zodResolver(ChatConfigSchema),
  })

  useEffect(() => {
    const loadInitialData = async () => {
      setConfigFormState(prev => ({ ...prev, isCreatingNew: false, loading: true }))
      try {
        const result = await listChatConfigs()
        if (result?.data) {
          const selectedConfig = configKey
            ? result.data.find(config => config.key === configKey) || null
            : null
          setConfigFormState(prev => ({
            ...prev,
            configurations: result.data,
            selectedConfig,
          }))
          if (selectedConfig) {
            form.reset(selectedConfig)
          }
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load configurations",
          variant: "destructive",
        })
      } finally {
        setConfigFormState(prev => ({ ...prev, isCreatingNew: false, loading: false }))
      }
    }

    loadInitialData()
  }, [configKey, form])

  const setCodeToQueryString = (key?: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (!key) {
      params.delete(SEARCH_PARAMS_KEY)
    } else {
      params.set(SEARCH_PARAMS_KEY, key)
    }
    router.replace(`?${params.toString()}`)
  }

  const handleSelectChange = (key: string) => {
    const foundConfig = configFormState.configurations.find(config => config.key === key)
    if (foundConfig) {
      setConfigFormState(prev => ({ ...prev, isCreatingNew: false, selectedConfig: foundConfig }))
      form.reset(foundConfig)
      setCodeToQueryString(foundConfig.key)
    }
  }

  const handleNewClick = () => {
    setConfigFormState(prev => ({ ...prev, isCreatingNew: true, selectedConfig: CHAT_DEFAULT_CONFIG }))
    form.reset(CHAT_DEFAULT_CONFIG)
    setCodeToQueryString(null)
  }

  const handleCancel = () => {
    setConfigFormState(prev => ({ ...prev, isCreatingNew: false, selectedConfig: null }))
    setCodeToQueryString(null)
    form.reset(CHAT_DEFAULT_CONFIG)
  }

  const handleDelete = async () => {
    if (!configFormState.selectedConfig) return

    setConfigFormState(prev => ({ ...prev, loading: true }))
    try {
      await deleteChatConfig(configFormState.selectedConfig.key)
      setConfigFormState(prev => ({
        ...prev,
        configurations: prev.configurations.filter(config => config.key !== prev.selectedConfig?.key),
        selectedConfig: null,
      }))
      form.reset(CHAT_DEFAULT_CONFIG)
      setCodeToQueryString(null)
      toast({
        title: "Success",
        description: "Configuration has been deleted",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete configuration",
        variant: "destructive",
      })
    } finally {
      setConfigFormState(prev => ({ ...prev, loading: false }))
    }
  }

  const onSubmit = async (data: z.infer<typeof ChatConfigSchema>) => {
    setConfigFormState(prev => ({ ...prev, loading: true }))
    try {
      await upsertChatConfig(data)
      setConfigFormState(prev => ({
        ...prev,
        isCreatingNew: false, 
        configurations: [...prev.configurations.filter(config => config.key !== data.key), data],
        selectedConfig: data,
      }))
      setCodeToQueryString(data.key)
      toast({
        title: "Success",
        description: "Configuration has been updated",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update configuration",
        variant: "destructive",
      })
    } finally {
      setConfigFormState(prev => ({ ...prev, isCreatingNew: false, loading: false }))
    }
  }

  return (
    <div className="space-y-6 py-4 w-full">
      <div className="flex space-x-4 items-center">
        <Select
          value={configFormState.selectedConfig?.key || ''}
          onValueChange={handleSelectChange}
          disabled={configFormState.loading}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select a configuration" />
          </SelectTrigger>
          <SelectContent>
            {configFormState.configurations.map((config) => (
              <SelectItem key={config.key} value={config.key}>
                {config.key}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleNewClick} disabled={configFormState.loading}>New</Button>
      </div>

      {configFormState.selectedConfig && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {
              configFormState.isCreatingNew && (
                <FormField
                  control={form.control}
                  name="key"
    
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Configuration name"
                          autoComplete=""
                          disabled={configFormState.loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )
            }

            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Model</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={configFormState.loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                      <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="temperature"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Temperature: {field.value.toFixed(1)}</FormLabel>
                  <Slider
                    min={0}
                    max={1}
                    step={0.1}
                    value={[field.value]}
                    onValueChange={(value) => field.onChange(value[0])}
                    disabled={configFormState.loading}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="systemPrompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>System Prompt</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Enter system prompt"
                      className="h-32"
                      disabled={configFormState.loading}
                    />
                  </FormControl>
                  <FormDescription>
                    This is the prompt that the system will use to start the conversation.
                    See <a href="https://www.promptingguide.ai/introduction/examples" className="text-primary hover:underline">What makes a good prompt</a>.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-between items-center">
              <div>
                <Button variant="default" type="submit" disabled={configFormState.loading}>
                  {configFormState.loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel} className="ml-2" disabled={configFormState.loading}>
                  Cancel
                </Button>
              </div>
              {configFormState.configurations.some(config => config.key === configFormState.selectedConfig?.key) && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button type="button" variant="destructive" disabled={configFormState.loading}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the
                        &quot;{configFormState.selectedConfig?.key}&quot;.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </form>
        </Form>
      )}
    </div>
  )
}
