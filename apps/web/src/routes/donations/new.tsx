import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CreateDonationForm } from "@/modules/donation/forms/create-donation";
import { BackToDonationsButton } from "@/modules/donation/forms/back-to-donations-button";

export const Route = createFileRoute("/donations/new")({
  component: NewDonationPage,
});

function NewDonationPage() {
  const navigate = useNavigate();
  const goToList = () => navigate({ to: "/donations" });

  return (
    <div className="-mt-4 space-y-10">
      <BackToDonationsButton />

      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight">Create Donation</h2>
        <p className="text-gray-400 mt-1">Record a new donation.</p>
      </div>

      <CreateDonationForm onCreated={goToList} onCancel={goToList} />
    </div>
  );
}
