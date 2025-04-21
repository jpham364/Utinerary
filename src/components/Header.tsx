
import supabase from "@/utils/supabase";

import { User, LogOut} from "lucide-react";
import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header(){


    return (
        <>
            <header className="border-b py-4 flex justify-between items-center">
            <h1 className="text-4xl font-bold font-family-sans">Utinerary</h1>

            <div className="flex items-center gap-4">
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button className="hover:border-gray-600">
                    <User />
                    Profile
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    {/* <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4"/>Settings
                    </DropdownMenuItem> */}
                    
                    <DropdownMenuItem
                    onClick={async () => {
                        await supabase.auth.signOut();
                        window.location.href = "/"; // or use router.push("/") if you're using React Router
                    }}
                    >
                    <LogOut className="mr-2 h-4 w-4" /> Log Out
                    </DropdownMenuItem>
                    
                </DropdownMenuContent>
                </DropdownMenu>
            </div>
            </header>
        </>
    )
}