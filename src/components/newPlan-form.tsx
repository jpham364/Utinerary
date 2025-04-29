"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/utils/utils"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"


import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

import supabase from "@/utils/supabase"


const formSchema = z.object({
  title: z.string()
    .min(1, { message: "Title cannot be empty."})
    .max(50, { message: "Title cannot be longer than 30 characters." }),
  start: z.date({
    required_error: "A day is required."
  }),
  location: z.string()
    .min(1, {message: "Location cannot be empty."})
    .max(30, { message: "Title cannot be longer than 30 characters." })
    .optional(),
  
})

export function NewPlanForm({
  onPlanCreated,
  onCloseDialog,
}: {
  onPlanCreated: () => void;
  onCloseDialog: () => void;
}) {
  
    // 1. Define form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      start: undefined,
      location: "",
    },
  })

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
 
    const user = await supabase.auth.getUser()
    const userId = user?.data?.user?.id

    const { data, error } = await supabase
      .from("plans")
      .insert([
        {
          title: values.title,
          start: values.start,
          location: values.location || "",
          user_id: userId
        },
      ])

    if (error) {
      console.error("Plan insert error:", error)
    } 
    else{
      // Test console log
      console.log("Plan inserted! - ", data)
      form.reset()
      onPlanCreated()
      onCloseDialog()
    }

    console.log(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter a title"{...field} />
              </FormControl>
              
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="start"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input placeholder="City or Neighborhood" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Create</Button>

      </form>
    </Form>
  )
}


