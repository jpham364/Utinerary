import { useParams } from "react-router"
import { useEffect, useState } from "react"
import supabase from "@/utils/supabase"
import { Link } from "react-router"

import { Header } from "@/components/Header"
import { Button } from "@/components/ui/button"
import { ChevronLeft, MapPin } from "lucide-react"
import { useNavigate } from "react-router"


import { format } from "date-fns"


const demoActivities = [
  {
    id: "1",
    title: "Brunch at Pine State",
    start_time: "2025-04-21T10:30:00Z",
    location: "Pine State Biscuits",
  },
  {
    id: "2",
    title: "Walk at Laurelhurst Park",
    start_time: "2025-04-21T13:00:00Z",
    location: "Laurelhurst Park",
  },
  {
    id: "3",
    title: "Coffee at Coava",
    start_time: "2025-04-21T15:30:00Z",
    location: "Coava Coffee",
  },
]

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

        {/* Activities Section */}
        <div className="mt-10 space-y-4">

          {/* Header */}
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-foreground">Activities</h2>
            <Button variant="outline" size="sm" onClick={() => console.log("Navigate to add activity")}>
              + Add Activity
            </Button>
          </div>

          {demoActivities.map((a) => (
            <div className="border rounded-lg p-3 space-y-1 hover:shadow-lg transition-shadow duration-200">
              <div className="flex justify-between">
                <h3 className="font-semibold">{a.title}</h3>
                <span className="text-sm text-muted-foreground">
                  {format(new Date(a.start_time), "p")}
                </span>
              </div>
              <p className="text-muted-foreground text-sm flex flex-row gap-2"> <MapPin size={20} strokeWidth={1.5} /> {a.location}</p>
            </div>
          ))}


        </div>


      </div>
    </div>
  );
}