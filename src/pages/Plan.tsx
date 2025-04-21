import { useParams } from "react-router"
import { useEffect, useState } from "react"
import supabase from "@/utils/supabase"

import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import { useNavigate } from "react-router"

import { format } from "date-fns"

export default function Plan() {

  const navigate = useNavigate();

  const { id } = useParams<{ id: string }>()

  const [plan, setPlan] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  

  useEffect(() => {
    const fetchPlan = async () => {
      const { data, error } = await supabase
        .from("plans")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Failed to fetch plan:", error)
      } 
      else {
        setPlan(data)
      }
      setLoading(false)
    };
    fetchPlan();
  }, [id])

  if (loading) return <p></p>

  if (!plan) return <p>Plan not found.</p>

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header nav bar */}
        <Header/>

        {/* Buttons  */}
        <div className="flex justify-start mt-4 mb-4">
          <Button 
            variant="outline"
            onClick={() => navigate("/home")}>
              <ChevronLeft />Back
          </Button>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold mt-4">{plan.title}</h1>

        {/* Basic information */}
        <div className="bg-muted rounded-2xl p-4 mt-4 space-y-4 text-muted-foreground shadow">
          
          {/* Header */}
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-lg text-foreground">Details</h2>
            <Button variant="default" size="sm" onClick={() => console.log("Open edit modal")}>
              Edit
            </Button>
          </div>
          

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">

            {/* Date */}
            <div className="space-y-1">
              <p className="text-foreground font-medium">Start Date</p>
              <p>{plan.start ? format(new Date(plan.start), "PPP") : "No date"}</p>

              <p className="text-foreground font-medium mt-2">End Date</p>
              <p>{plan.end ? format(new Date(plan.end), "PPP") : "No date"}</p>
            </div>

            {/* Time */}
            <div className="space-y-1">
              <p className="text-foreground font-medium">Start Time</p>
              <p>{plan.start ? format(new Date(plan.start), "p") : "No time"}</p>

              <p className="text-foreground font-medium mt-2">End Time</p>
              <p>{plan.end ? format(new Date(plan.end), "p") : "No time"}</p>
            </div>

            {/* Location */}
            <div className="space-y-1">
              <p className="text-foreground font-medium">Location</p>
              <p>{plan.location || "No location set"}</p>
            </div>
          </div>

        </div>








      </div>
    </div>
  );
}