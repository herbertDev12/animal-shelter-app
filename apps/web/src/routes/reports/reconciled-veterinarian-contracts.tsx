import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { useMemo } from "react";
import { CustomTable } from "@/components/custom-table";
import type { ColumnDef } from "@tanstack/react-table";

export const reconciledVeterinarianContractSchema = z.object({
  veterinarian_name: z.string().min(1),
  clinic_name: z.string().min(1),
  specialty: z.string().min(1),
  province: z.string().min(1),
  address: z.string().min(1),
  start_date: z.date(),
  end_date: z.date(),
  reconciliation_date: z.date(),
  description: z.string().min(1),
});

type Contract = z.infer<typeof reconciledVeterinarianContractSchema>;

const mockData: Contract[] = [
  {
    veterinarian_name: "John Doe",
    clinic_name: "Bark & Meow Clinic",
    specialty: "Surgery",
    province: "Gauteng",
    address: "123 Main Street, Pretoria",
    start_date: new Date("2024-01-15"),
    end_date: new Date("2024-12-31"),
    reconciliation_date: new Date("2025-01-15"),
    description:
      "General surgical procedures for shelter animals including spay/neuter, orthopedic surgeries, and emergency operations.",
  },
  {
    veterinarian_name: "Jane Smith",
    clinic_name: "Paws & Hearts Veterinary",
    specialty: "Cardiology",
    province: "Western Cape",
    address: "45 Beach Road, Cape Town",
    start_date: new Date("2024-03-01"),
    end_date: new Date("2025-02-28"),
    reconciliation_date: new Date("2025-03-10"),
    description:
      "Cardiac diagnostics and treatment for rescued animals with heart conditions.",
  },
  {
    veterinarian_name: "Michael Chen",
    clinic_name: "Animal Care Plus",
    specialty: "Dermatology",
    province: "KwaZulu-Natal",
    address: "78 Oak Avenue, Durban",
    start_date: new Date("2024-06-01"),
    end_date: new Date("2025-05-31"),
    reconciliation_date: new Date("2025-06-05"),
    description:
      "Treatment of skin conditions, allergies, and parasitic infections in shelter animals.",
  },
  {
    veterinarian_name: "Sarah Williams",
    clinic_name: "Hope Veterinary Services",
    specialty: "Ophthalmology",
    province: "Eastern Cape",
    address: "12 River Street, Port Elizabeth",
    start_date: new Date("2024-02-01"),
    end_date: new Date("2024-11-30"),
    reconciliation_date: new Date("2024-12-15"),
    description:
      "Eye surgeries and treatments for animals with vision impairments and infections.",
  },
  {
    veterinarian_name: "David Martinez",
    clinic_name: "Green Valley Animal Hospital",
    specialty: "Orthopedics",
    province: "Mpumalanga",
    address: "56 Forest Lane, Nelspruit",
    start_date: new Date("2024-04-15"),
    end_date: new Date("2025-04-14"),
    reconciliation_date: new Date("2025-04-20"),
    description:
      "Orthopedic surgeries including fracture repairs, joint replacements, and rehabilitation.",
  },
  {
    veterinarian_name: "Emily Johnson",
    clinic_name: "Companion Care Vet",
    specialty: "Neurology",
    province: "Limpopo",
    address: "89 Bushveld Drive, Polokwane",
    start_date: new Date("2024-05-01"),
    end_date: new Date("2025-04-30"),
    reconciliation_date: new Date("2025-05-10"),
    description:
      "Neurological assessments, MRI diagnostics, and spinal surgery for shelter animals.",
  },
  {
    veterinarian_name: "Robert Brown",
    clinic_name: "Four Paws Clinic",
    specialty: "Dentistry",
    province: "Free State",
    address: "34 Diamond Street, Bloemfontein",
    start_date: new Date("2024-07-01"),
    end_date: new Date("2025-06-30"),
    reconciliation_date: new Date("2025-07-05"),
    description:
      "Dental cleanings, extractions, and oral surgery for rescued animals.",
  },
  {
    veterinarian_name: "Amanda Lee",
    clinic_name: "Pet Wellness Centre",
    specialty: "Internal Medicine",
    province: "North West",
    address: "67 Acacia Road, Mahikeng",
    start_date: new Date("2024-08-15"),
    end_date: new Date("2025-08-14"),
    reconciliation_date: new Date("2025-08-20"),
    description:
      "Diagnosis and treatment of internal diseases including gastrointestinal, respiratory, and endocrine disorders.",
  },
];

export const Route = createFileRoute(
  "/reports/reconciled-veterinarian-contracts",
)({
  component: ReconciledVeterinarianContractsComponent,
});

function ReconciledVeterinarianContractsComponent() {
  const columns = useMemo<ColumnDef<Contract>[]>(
    () => [
      {
        header: "Veterinarian Name",
        accessorKey: "veterinarian_name",
        cell: ({ row }) => (
          <span className="text-sm font-bold text-white">
            Dr. {row.original.veterinarian_name}
          </span>
        ),
      },
      {
        header: "Clinic Name",
        accessorKey: "clinic_name",
        cell: ({ getValue }) => (
          <span className="text-sm text-gray-300">{getValue() as string}</span>
        ),
      },
      {
        header: "Specialty",
        accessorKey: "specialty",
        cell: ({ getValue }) => (
          <span className="text-xs text-purple-400 font-medium px-2 py-1 rounded-full bg-purple-500/10">
            {getValue() as string}
          </span>
        ),
      },
      {
        id: "location",
        header: "Location",
        accessorFn: (row) => `${row.province}, ${row.address}`,
        cell: ({ row }) => (
          <div>
            <p className="text-sm text-white">{row.original.province}</p>
            <p className="text-[10px] text-gray-400">{row.original.address}</p>
          </div>
        ),
      },
      {
        id: "duration",
        header: "Duration",
        accessorFn: (row) =>
          `${row.start_date.toLocaleDateString()} - ${row.end_date.toLocaleDateString()}`,
        cell: ({ row }) => (
          <span className="text-sm text-gray-300 whitespace-nowrap">
            {row.original.start_date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}{" "}
            -{" "}
            {row.original.end_date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        ),
      },
      {
        header: "Reconciliation Date",
        accessorKey: "reconciliation_date",
        cell: ({ row }) => (
          <span className="text-sm text-gray-300">
            {row.original.reconciliation_date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        ),
      },
      {
        header: "Description",
        accessorKey: "description",
        cell: ({ row }) => {
          const desc = row.original.description;
          return (
            <span
              className="text-sm text-gray-400 max-w-[240px] block truncate"
              title={desc}
            >
              {desc}
            </span>
          );
        },
      },
    ],
    [],
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 pt-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Reconciled Veterinarian Contracts
        </h2>
        <p className="text-gray-400 mt-1">
          View and manage reconciled contracts for shelter veterinarians.
        </p>
      </div>
      <CustomTable columns={columns} data={mockData} />
    </div>
  );
}
