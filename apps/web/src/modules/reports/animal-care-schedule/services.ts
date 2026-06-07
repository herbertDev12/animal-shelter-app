export const fetchAnimalCareSchedule = async (idAnimal: number) => {
  const response = await fetch(
    `${import.meta.env.VITE_PUBLIC_API_URL}/reports/animal-care-schedule?id_animal=${idAnimal}`,
  );
  if (!response.ok) throw new Error("Network response was not ok");
  return response.json();
};
