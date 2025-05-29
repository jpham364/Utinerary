"use client"

import supabase from "../utils/supabase";
import { useEffect, useState } from "react"
import { Link } from "react-router"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { EllipsisVertical } from "lucide-react";



import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/Header";

import { NewPlanForm } from "@/components/forms/newPlan-form";
import { format } from "date-fns"

function Home() {

  type Plan = {
    id: number;
    title: string;
    start: string | null;
    public_token: string;
    // add other fields as needed
  };

  const [plans, setPlans] = useState<Plan[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)

  const fetchPlans = async () => {
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("No authenticated user found:", userError);
      setPlans([]);
      return;
    }

    const { data, error } = await supabase
      .from("plans")
      .select("*")
      .eq("user_id", user.id);

    if (error) {
      console.error("Error loading plans:", error);
    } else {
      setPlans(data);
    }
  };

  const handleDelete = async (planId: number) => {

    const confirmed = window.confirm("Are you sure you want to delete this plan?");
    if (!confirmed) return;

    const { error } = await supabase
      .from('plans')
      .delete()
      .eq('id', planId);
  
    if (error) {
      console.error("Error deleting plan:", error);
    } else {
      console.log("Plan deleted successfully!");
      fetchPlans(); // Refresh the list after deletion
    }
  };

  useEffect(() => {
    fetchPlans()
  }, [])

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">

        {/* Insert Header */}
        <Header/>
        
        {/* Buttons & tabs */}
        <div className="flex justify-end mt-4 mb-4">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Create Plan</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create a New Plan</DialogTitle>
                <DialogDescription>
                  Set up basic details for your new plan.
                </DialogDescription>
              </DialogHeader>

              {/* New Plan Form */}
              <NewPlanForm 
                onPlanCreated={fetchPlans}
                onCloseDialog={() => setDialogOpen(false)} 
              />
              
            </DialogContent>
          </Dialog>
        </div>

        {/* Main content grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className="hover:shadow-lg transition-shadow duration-200"
            >

              <CardHeader className="flex flex-row justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{plan.title}</CardTitle>
                  <p className="text-muted-foreground text-sm">
                    {plan.start ? format(new Date(plan.start), "PPP") : "No date"}
                  </p>
                </div>

                {/* Dropdown Button */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost" >
                      <EllipsisVertical size={48} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleDelete(plan.id)}>
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

              </CardHeader>

              <CardContent>
                <div className="mt-4">
                  <Link to={`/plan/${plan.public_token}`}>
                    <Button size="sm" variant="secondary">
                      View Plan
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
export default Home;
