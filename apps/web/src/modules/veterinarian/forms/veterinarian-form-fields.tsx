import { Control, FieldValues, Path } from "react-hook-form";
import { RHFInput } from "@/components/fields/rhf-input";
import { RHFNumberInput } from "@/components/fields/rhf-number-input";
import { RHFFkSelect } from "@/components/fields/rhf-fk-select";
import { fetchClinics } from "@/modules/clinic/services";

const fieldClassName =
  "bg-[#0b0e14] border-gray-800 text-white placeholder:text-gray-500";

export function VeterinarianFormFields<T extends FieldValues>({
  control,
}: {
  control: Control<T>;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <RHFInput
        name={"name" as Path<T>}
        control={control}
        label="Name"
        placeholder="Veterinarian name"
        required
        className={fieldClassName}
      />
      <RHFFkSelect
        name={"id_clinic" as Path<T>}
        control={control}
        label="Clinic"
        placeholder="Select a clinic"
        queryKey={["clinics", "options"]}
        queryFn={() =>
          fetchClinics({ limit: 100 }).then((rows) =>
            rows.map((c) => ({ id: c.id, label: c.name })),
          )
        }
      />
      <RHFInput
        name={"specialty" as Path<T>}
        control={control}
        label="Specialty"
        placeholder="Optional"
        className={fieldClassName}
      />
      <RHFInput
        name={"modality" as Path<T>}
        control={control}
        label="Modality"
        placeholder="Optional"
        className={fieldClassName}
      />
      <RHFInput
        name={"contact_name" as Path<T>}
        control={control}
        label="Contact name"
        placeholder="Optional"
        className={fieldClassName}
      />
      <RHFInput
        name={"contact_email" as Path<T>}
        control={control}
        label="Contact email"
        placeholder="Optional"
        className={fieldClassName}
      />
      <RHFInput
        name={"veterinarian_email" as Path<T>}
        control={control}
        label="Veterinarian email"
        placeholder="Optional"
        className={fieldClassName}
      />
      <RHFInput
        name={"phone" as Path<T>}
        control={control}
        label="Phone"
        placeholder="Optional"
        className={fieldClassName}
      />
      <RHFInput
        name={"fax" as Path<T>}
        control={control}
        label="Fax"
        placeholder="Optional"
        className={fieldClassName}
      />
      <RHFInput
        name={"province" as Path<T>}
        control={control}
        label="Province"
        placeholder="Optional"
        className={fieldClassName}
      />
      <RHFInput
        name={"address" as Path<T>}
        control={control}
        label="Address"
        placeholder="Optional"
        className={fieldClassName}
      />
      <RHFNumberInput
        name={"city_distance" as Path<T>}
        control={control}
        label="City distance"
        placeholder="Optional"
        step="0.1"
      />
    </div>
  );
}
