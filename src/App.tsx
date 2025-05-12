
import { Routes, Route } from "react-router"
import ProtectedRoute from "@/components/ProtectedRoute"

import Landing from "@/pages/Landing"
import Login from "@/pages/Login"
import Signup from "@/pages/Signup"
import Home from "@/pages/Home"
import Plan from "./pages/Plan"

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/plan/:token" element={<Plan />} />
      <Route 
        path="/home"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default App
