/**
 * Reusable utility for worker rate permissions and category editability rules.
 */

// Categories where the work rate is dynamic/variable and can change per entry
export const VARIABLE_RATE_CATEGORIES = [
  "KACHA_MAAL", // कच्चा माल मजूर
  "PAKKA_MAAL",  // पक्का माल मजूर
] as const;

export type VariableRateCategory = (typeof VARIABLE_RATE_CATEGORIES)[number];

export interface RatePermissionOptions {
  /**
   * Optional user role (e.g., 'ADMIN', 'OWNER', 'MANAGER') for future role-based overrides
   */
  userRole?: string;
  /**
   * Explicit override flag to force editability
   */
  allowAll?: boolean;
  /**
   * List of additional categories permitted to edit rate
   */
  additionalCategories?: string[];
}

/**
 * Helper to determine if the rate field should be editable when recording daily work.
 *
 * @param category - The worker's category (e.g. 'KACHA_MAAL', 'PAKKA_MAAL', 'AALYAWALE', 'BHATKAR')
 * @param options - Context options for user role or category overrides
 * @returns boolean - Whether the rate is editable for the given context
 */
export function isRateEditableForCategory(
  category: string | null | undefined,
  options?: RatePermissionOptions
): boolean {
  if (!category) return false;
  if (options?.allowAll) return true;

  const normalizedCategory = category.trim().toUpperCase();

  // 1. Default check for variable rate categories (KACHA_MAAL, PAKKA_MAAL)
  const isVariableRateCat = (VARIABLE_RATE_CATEGORIES as readonly string[]).includes(
    normalizedCategory
  );
  if (isVariableRateCat) return true;

  // 2. Custom additional categories check
  if (
    options?.additionalCategories?.some(
      (cat) => cat.trim().toUpperCase() === normalizedCategory
    )
  ) {
    return true;
  }

  // 3. Future expansion: Role-based permissions (e.g., MANAGER or ADMIN override)
  if (
    options?.userRole &&
    ["ADMIN", "OWNER", "MANAGER"].includes(options.userRole.trim().toUpperCase())
  ) {
    // If future requirement requires role-based permission override, uncomment below:
    // return true;
  }

  return false;
}
