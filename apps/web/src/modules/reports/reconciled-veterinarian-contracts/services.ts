export const fetchReconciledVeterinarianContracts = async () => {
  const response = await fetch(
    `${import.meta.env.VITE_PUBLIC_API_URL}/reports/reconciled-veterinarian-contracts`,
  );
  if (!response.ok) throw new Error("Network response was not ok");
  return response.json();
};
