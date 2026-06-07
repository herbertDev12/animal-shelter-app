export const fetchComplementaryServiceContracts = async () => {
  const response = await fetch(
    `${import.meta.env.VITE_PUBLIC_API_URL}/reports/complementary-service-contracts`,
  );
  if (!response.ok) throw new Error("Network response was not ok");
  return response.json();
};
