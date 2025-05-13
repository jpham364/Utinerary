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

interface AddCollaboratorsProps {
  plan: { id: string };
}

const formSchema = z.object({
  collaborator_email: z.string().email({ message: "Enter a valid email address." }),
});

export function AddCollaboratorsForm({ plan }: AddCollaboratorsProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      collaborator_email: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { error } = await supabase
      .from("plan_collaborators")
      .insert([
        {
          plan_id: plan.id,
          collaborator_email: values.collaborator_email,
        },
      ]);

    if (error) {
      console.error("Error adding collaborator:", error);
    } else {
      console.log("Collaborator added successfully!");
      form.reset();
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="collaborator_email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Collaborator Email</FormLabel>
              <FormControl>
                <Input placeholder="e.g. friend@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          Add
        </Button>
      </form>
    </Form>
  );
}