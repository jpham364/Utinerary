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


import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/Header";

import { NewPlanForm } from "@/components/newPlan-form";
import { format } from "date-fns"

function Home() {

  type Plan = {
    id: number;
    title: string;
    start: string | null;
    // add other fields as needed
  };

  const [plans, setPlans] = useState<Plan[]>([])

  const [dialogOpen, setDialogOpen] = useState(false)

  const fetchPlans = async () => {
    const { data, error } = await supabase.from('plans').select()
    if (error){
      console.error("Error loading plans:", error)
    }
    else{
      setPlans(data)
    }
  }

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
              <Button variant="outline">Create Utinerary</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create a New Utinerary</DialogTitle>
                <DialogDescription>
                  Set up basic details for your new Utinerary.
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
              <CardHeader>
                <CardTitle className="text-xl">{plan.title}</CardTitle>
                <p className="text-muted-foreground text-sm">
                  {plan.start ? format(new Date(plan.start), "PPP") : "No date"}
                </p>
              </CardHeader>
              <CardContent>
                <div className="mt-4">
                  <Link to={`/plan/${plan.id}`}>
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
