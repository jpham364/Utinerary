import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react"; // optional icon
import { Button } from "@/components/ui/button";

export function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return isVisible ? (
    <Button
      variant="default"
      className="fixed bottom-10 right-10 h-12 w-12 rounded-full p-5 shadow-lg"
      onClick={scrollToTop}
    >
      <ArrowUp size={32} strokeWidth={2.5} />
    </Button>
  ) : null;
}
