export const fetchActiveVeterinarians = async () => {
  const response = await fetch(
    `${import.meta.env.VITE_PUBLIC_API_URL}/reports/active-veterinarians`,
  );
  if (!response.ok) throw new Error("Network response was not ok");
  return response.json();
};
