/**
 * The permission catalog — the single source of truth for every permission code.
 *
 * The seed writes these rows into the `permissions` table, and controllers
 * reference the codes through `@RequirePermission`, so a typo in either place is
 * a compile error rather than a silently unreachable endpoint.
 *
 * Codes follow `<module>.<action>`. There are only three actions; DELETE
 * endpoints require `.edit`.
 */
export const PERMISSION_MODULES = [
  { module: 'animal', label: 'an animal' },
  { module: 'clinic', label: 'a clinic' },
  { module: 'supplier', label: 'a supplier' },
  { module: 'veterinarian', label: 'a veterinarian' },
  { module: 'contract', label: 'a contract' },
  { module: 'transport-service', label: 'a transport service' },
  { module: 'service-offered', label: 'an offered service' },
  { module: 'activity', label: 'an activity' },
  { module: 'donation', label: 'a donation' },
  { module: 'adoption', label: 'an adoption' },
  { module: 'reports', label: 'reports' },
  { module: 'auth', label: 'a user' },
  { module: 'role', label: 'a role' },
] as const;

export const PERMISSION_ACTIONS = ['create', 'read', 'edit'] as const;

export type PermissionModule = (typeof PERMISSION_MODULES)[number]['module'];
export type PermissionAction = (typeof PERMISSION_ACTIONS)[number];
export type PermissionCode = `${PermissionModule}.${PermissionAction}`;

const ACTION_VERBS: Record<PermissionAction, string> = {
  create: 'creating',
  read: 'reading',
  edit: 'editing',
};

export interface PermissionDefinition {
  code: PermissionCode;
  name: string;
}

export const PERMISSION_CATALOG: readonly PermissionDefinition[] =
  PERMISSION_MODULES.flatMap(({ module, label }) =>
    PERMISSION_ACTIONS.map((action) => ({
      code: `${module}.${action}` as const,
      name: `Permission for ${ACTION_VERBS[action]} ${label}`,
    })),
  );

export const ADMIN_ROLE = 'Admin';
export const WORKER_ROLE = 'Worker';

export const WORKER_EXCLUDED_MODULES: readonly PermissionModule[] = [
  'auth',
  'role',
];
