"use client";

import { useEffect } from "react";
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
  FormDescription
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
import { Checkbox } from "../ui/checkbox";

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
  date: z.date().optional(),
  time: z.date().optional(),
  notes: z.string().max(280, {
    message: "Notes must not be longer than 280 characters.",
  }),
  unscheduled: z.boolean().optional(),
  category: z
  .union([
    z.enum(["Dining", "Shopping", "Outdoors", "Entertainment", "Travel", "Other"]),
    z.literal(""),
  ])
  .optional(),
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
      unscheduled: activity.start === null,
      category: activity.category || ""
    },
  });

  // This will watch when the toggle for no time is selected
  // When the button is checked, it will clear the input forms
  const unscheduled = form.watch("unscheduled");
  
  useEffect(() => {
    if (unscheduled) {
      form.setValue("date", undefined);
      form.setValue("time", undefined);
    }
  }, [unscheduled, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    
    let fullStart: Date | null = null;
    if (!values.unscheduled && values.date && values.time) {
      fullStart = new Date(
        `${format(values.date, "yyyy-MM-dd")}T${format(values.time, "HH:mm")}`
      );
    }

    const { error } = await supabase
      .from("activities")
      .update({
        title: values.title,
        location: values.location,
        start: fullStart,
        notes: values.notes,
        category: values.category
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

  const dateValue = form.watch("date");
  const timeValue = form.watch("time");


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
          name="unscheduled"
          render={({ field }) => (
            <FormItem className="flex items-center space-x-3">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="h-5 w-5"
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Don’t know the time yet?</FormLabel>
                <FormDescription>
                  Leave the date and time blank for now.
                </FormDescription>
              </div>
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
                      disabled={form.watch("unscheduled")}
                      className={cn(
                        "w-[240px] justify-start pl-3 text-left font-normal",
                        !dateValue && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateValue ? format(dateValue, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateValue ?? undefined}
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
                      disabled={form.watch("unscheduled")}
                      className={cn(
                        "w-[280px] justify-start text-left font-normal",
                        !timeValue && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {timeValue ? (
                        format(timeValue, "hh:mm a")
                      ) : (
                        <span>Pick a time</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                </FormControl>
                <PopoverContent className="w-auto p-0">
                  <div className="p-3 border-t border-border">
                    <TimePicker12 setDate={field.onChange} date={timeValue} />
                  </div>
                </PopoverContent>
              </Popover>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <select {...field} className="w-full border p-2 rounded-md">
                  <option value="">Select a category</option>
                  <option value="Dining">Dining</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Other">Other</option>
                </select>
              </FormControl>
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

        <Button type="submit">Update Activity</Button>
      </form>
    </Form>
  );
}
