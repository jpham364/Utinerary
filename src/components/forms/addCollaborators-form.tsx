"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import supabase from "@/utils/supabase";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  collaboratorEmails: string[];
  onUpdate: () => void;
}

const formSchema = z.object({
  collaborator_email: z.string().email({ message: "Enter a valid email address." }),
});

export function AddCollaboratorsForm({ plan, collaboratorEmails, onUpdate }: AddCollaboratorsProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      collaborator_email: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const newEmail = values.collaborator_email.trim().toLowerCase();

    if (collaboratorEmails.includes(newEmail)) {
      form.setError("collaborator_email", {
        type: "manual",
        message: "This email is already added.",
      });
      return;
    }

    const { error } = await supabase.from("plan_collaborators").insert([
      {
        plan_id: plan.id,
        collaborator_email: newEmail,
      },
    ]);

    if (error) {
      console.error("Error adding collaborator:", error);
    } else {
      onUpdate(); // Call parent to refetch
      form.reset();
    }
  }

  const handleDelete = async (email: string) => {
    const { error } = await supabase
      .from("plan_collaborators")
      .delete()
      .eq("plan_id", plan.id)
      .eq("collaborator_email", email);

    if (error) {
      console.error("Error deleting collaborator:", error);
    } else {
      onUpdate(); // Call parent to refetch
      form.reset();
    }
  };

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
       
        <div className="space-y-1 text-sm">
          <p className="text-muted-foreground font-medium">Current Collaborators:</p>
            <ScrollArea className="h-[200px] w-full rounded-md border p-4">
              <div className="flex flex-col gap-3">
              {collaboratorEmails.map((email) => (
                <div key={email} className="flex justify-between">
                  <p>{email}</p>
                  <Button size="sm" type="button" onClick={() => handleDelete(email)}>Remove</Button>
                </div>
              ))}
              </div>
            </ScrollArea>
      
        </div>

        <Button type="submit" className="w-full">
          Add
        </Button>
      </form>
    </Form>
  );
}