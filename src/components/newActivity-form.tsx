"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import supabase from "@/utils/supabase"
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

import { TimePicker12 } from "./time-picker"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/utils/utils"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns";


// Zod schema
const formSchema = z.object({
  title: z.string()
    .min(1, { message: "Title cannot be empty."})
    .max(50, { message: "Title cannot be longer than 30 characters." }),
  location: z.string()
    .min(1, { message: "Location is required.",})
    .max(35, { message: "Title cannot be longer than 30 characters." }),
  time: z.date().optional(),
})

type NewActivityFormProps = {
  planId: string
  onPlanCreated: () => void
  onCloseDialog: () => void
}


export function NewActivityForm({
    planId,
    onPlanCreated,
    onCloseDialog,
}: NewActivityFormProps) { 
  
  
    const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      location: "",
      time: undefined
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    
    const user = await supabase.auth.getUser()
    const userId = user?.data?.user?.id

    const { data, error } = await supabase
      .from("activities")
      .insert([
        {
          title: values.title,
          location: values.location,
          start: values.time,
          plan_id: planId,
          user_id: userId
        },
      ])

    if (error) {
      console.error("Activity insert error:", error)
    } else {
      console.log("Activity inserted!", data)
      form.reset()
      onPlanCreated()
      onCloseDialog()
    }
  }

  

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter a title" {...field} />
              </FormControl>
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
                <Input placeholder="Enter a location" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="time"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="text-left">Time (optional)</FormLabel>
              <Popover>
                <FormControl>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[280px] justify-start text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? (
                        format(field.value, "hh:mm a")
                      ) : (
                        <span>Pick a time</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                </FormControl>
                <PopoverContent className="w-auto p-0">
                  
                  <div className="p-3 border-t border-border">
                    <TimePicker12
                      setDate={field.onChange}
                      date={field.value}
                    />
                  </div>
                </PopoverContent>
              </Popover>
            </FormItem>
          )}
        />

          
        <Button type="submit">Create Activity</Button>
      </form>
    </Form>
  )
}