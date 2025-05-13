import { useEffect, useState } from "react";
import supabase from "@/utils/supabase";

import { User, LogOut, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useNavigate } from "react-router"

export function Header() {

  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Fetch current user on mount
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    getUser();
  }, []);

  return (
    <header className="border-b py-4 flex justify-between items-center">
      <h1 className="text-4xl font-bold font-family-sans">Utinerary</h1>

      <div className="flex items-center gap-4">
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="hover:border-gray-600">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={async () => {
                  await supabase.auth.signOut();
                  navigate("/");
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            variant="default"
            onClick={() => {
              const currentUrl = window.location.pathname + window.location.search;
              navigate(`/login?redirect=${encodeURIComponent(currentUrl)}`);
            }}
          >
            <LogIn className="mr-2 h-4 w-4" />
            Log In
          </Button>
        )}
      </div>
    </header>
  );
}