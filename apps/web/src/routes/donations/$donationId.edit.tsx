import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { EditDonationForm } from "@/modules/donation/forms/edit-donation";
import { BackToDonationsButton } from "@/modules/donation/forms/back-to-donations-button";
import { fetchDonation } from "@/modules/donation/services";

export const Route = createFileRoute("/donations/$donationId/edit")({
  component: EditDonationPage,
});

function EditDonationPage() {
  const { donationId } = Route.useParams();
  const id = Number(donationId);
  const navigate = useNavigate();
  const goToList = () => navigate({ to: "/donations" });

  const {
    data: donation,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["donation", id],
    queryFn: () => fetchDonation(id),
  });

  return (
    <div className="-mt-4 space-y-10">
      <BackToDonationsButton />

      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight">Edit Donation</h2>
        <p className="text-gray-400 mt-1">
          Update this donation's information.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <p className="text-gray-400">Loading donation...</p>
        </div>
      ) : isError || !donation ? (
        <div className="flex items-center justify-center h-48">
          <p className="text-gray-400">Donation not found.</p>
        </div>
      ) : (
        <EditDonationForm
          donation={donation}
          onSaved={goToList}
          onCancel={goToList}
        />
      )}
    </div>
  );
}
