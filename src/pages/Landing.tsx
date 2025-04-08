import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router"

function Landing() {
  
  const navigate = useNavigate()
  return (
    <div className="flex flex-col items-center justify-center min-h-svh">
      <h1 className="text-7xl font-family-sans font-bold">Utinerary</h1>
      <h1 className="text-4xl font-family-sans font-semibold">Let's plan.</h1>
      
      <Button className="mt-4 text-xl p-5" onClick={() => navigate("/login")}> Get Started </Button>
    </div>
  )
}

export default Landing
