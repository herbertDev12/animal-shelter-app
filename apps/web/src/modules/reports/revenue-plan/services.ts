export const fetchRevenuePlan = async () => {
  const response = await fetch(
    `${import.meta.env.VITE_PUBLIC_API_URL}/reports/revenue-plan`,
  );
  if (!response.ok) throw new Error("Network response was not ok");
  return response.json();
};
