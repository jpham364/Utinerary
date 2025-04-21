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

        <div className="flex justify-start mt-4 mb-4">
          
          <Button 
            variant="outline"
            onClick={() => navigate(-1)}>
              <ChevronLeft />Back
          </Button>
            
        </div>

        <h1 className="text-3xl font-bold mt-4">{plan.title}</h1>
        <p className="text-muted-foreground">
          Start Date: {plan.start ? format(new Date(plan.start), "PPP") : "No date"}
        </p>


      </div>
    </div>
  );
}