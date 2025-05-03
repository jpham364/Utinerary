"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import supabase from "@/utils/supabase";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";

import { TimePicker12 } from "./time-picker";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/utils/utils";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

// Zod schema
const formSchema = z.object({
  title: z
    .string()
    .min(1, { message: "Title cannot be empty." })
    .max(50, { message: "Title cannot be longer than 30 characters." }),
  location: z
    .string()
    .min(1, { message: "Location is required." })
    .max(35, { message: "Title cannot be longer than 30 characters." }),
  date: z.date({ required_error: "Date is required." }),
  time: z.date({ required_error: "Time is required." }),
  notes: z.string().max(280, {
    message: "Notes must not be longer than 280 characters.",
  }),
});

type NewActivityFormProps = {
  planId: string;
  planStart: string;
  planEnd: string;
  onPlanCreated: () => void;
  onCloseDialog: () => void;
};

export function NewActivityForm({
  planId,
  planStart,
  planEnd,
  onPlanCreated,
  onCloseDialog,
}: NewActivityFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      location: "",
      date: undefined,
      time: undefined,
      notes: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const user = await supabase.auth.getUser();
    const userId = user?.data?.user?.id;

    const fullStart = new Date(
      `${format(values.date, "yyyy-MM-dd")}T${format(values.time, "HH:mm")}`
    );

    const { data, error } = await supabase.from("activities").insert([
      {
        title: values.title,
        location: values.location,
        start: fullStart,
        notes: values.notes,
        plan_id: planId,
        user_id: userId,
      },
    ]);

    if (error) {
      console.error("Activity insert error:", error);
    } else {
      console.log("Activity inserted!", data);
      form.reset();
      onPlanCreated();
      onCloseDialog();
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
                <Input
                  placeholder="Name or Address (e.g., Starbucks, 123 Main St)"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[240px] justify-start pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value ?? undefined}
                    onSelect={field.onChange}
                    fromDate={new Date(planStart)}
                    toDate={planEnd ? new Date(planEnd) : undefined}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="time"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="text-left">Time</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[240px] justify-start text-left font-normal",
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
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <div className="p-3 border-t border-border">
                    <TimePicker12
                      setDate={field.onChange}
                      date={field.value ?? undefined}
                    />
                  </div>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter additional activity details or things to remember"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Create Activity</Button>
      </form>
    </Form>
  );
}
