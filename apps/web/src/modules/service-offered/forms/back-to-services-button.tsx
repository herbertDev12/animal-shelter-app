import { Link } from "@tanstack/react-router";
import { Button } from "@repo/ui";
import { ArrowLeft } from "lucide-react";

export function BackToServicesButton() {
  return (
    <Link to="/services-offered">
      <Button className="rounded-lg bg-[#cc97ff] text-[#10131a] hover:bg-[#cc97ff]/90 font-bold">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
    </Link>
  );
}
