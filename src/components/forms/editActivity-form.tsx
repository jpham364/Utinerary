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

import { TimePicker12 } from "@/components/ui/timePicker/time-picker"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/utils/utils";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

type EditActivityFormProps = {
  activity: any;
  planStart: string;
  planEnd: string;
  onOpenChange: (open: boolean) => void;
  onActivityUpdated: () => void;
};

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

export function EditActivityForm({
  activity,
  planStart,
  planEnd,
  onOpenChange,
  onActivityUpdated,
}: EditActivityFormProps) {
  const initialDate = activity.start ? new Date(activity.start) : undefined;
  const initialTime = activity.start ? new Date(activity.start) : undefined;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: activity.title || "",
      location: activity.location || "",
      date: initialDate,
      time: initialTime,
      notes: activity.notes || "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const fullStart = new Date(
      `${format(values.date, "yyyy-MM-dd")}T${format(values.time, "HH:mm")}`
    );

    const { error } = await supabase
      .from("activities")
      .update({
        title: values.title,
        location: values.location,
        start: fullStart,
        notes: values.notes,
      })
      .eq("id", activity.id);

    if (error) {
      console.error("Activity update error:", error);
    } else {
      console.log("Activity updated successfully!");
      form.reset();
      onActivityUpdated();
      onOpenChange(false);
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

        {/* Date */}
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
                    <TimePicker12 setDate={field.onChange} date={field.value} />
                  </div>
                </PopoverContent>
              </Popover>
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

        <Button type="submit">Update Activity</Button>
      </form>
    </Form>
  );
}
