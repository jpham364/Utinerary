import { buttonVariants } from "@/components/ui/button"
import { Link } from "react-router"
import { cn } from "@/lib/utils"

function Landing() {
  
  return (
    <div className="flex flex-col items-center justify-center min-h-svh">
      <h1 className="text-7xl font-family-sans font-bold">Utinerary</h1>
      <h1 className="text-4xl font-family-sans font-semibold">Let's plan.</h1>
      
  
      <Link className={cn(buttonVariants({ variant: "default" }), "mt-4 text-xl p-5")}to="/signup"> Get Started </Link>
    </div>
  )
}

export default Landing
