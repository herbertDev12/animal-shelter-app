import { ContractCategory, ContractCategoryLabel } from '@repo/schemas';

/**
 * Human-readable name for a contract, which has no name column of its own:
 * "<supplier> · <category>", or just the supplier when the category is unset.
 */
export function contractLabel(
  supplierName: string,
  category: ContractCategory | null,
): string {
  const categoryLabel =
    category != null ? ContractCategoryLabel[category] : null;
  return categoryLabel ? `${supplierName} · ${categoryLabel}` : supplierName;
}
