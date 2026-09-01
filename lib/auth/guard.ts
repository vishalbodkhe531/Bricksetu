import { AuthUser } from './session';

export class AuthorizationError extends Error {
  constructor(message = 'Forbidden: Access denied for this organization') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export function assertOrgAccess(userOrgId: string, targetOrgId: string): void {
  if (!userOrgId || !targetOrgId || userOrgId !== targetOrgId) {
    throw new AuthorizationError('Forbidden: Access denied for target organization');
  }
}

export function assertRole(userRole: string, allowedRoles: string[]): void {
  if (!userRole || !allowedRoles.map(r => r.toUpperCase()).includes(userRole.toUpperCase())) {
    throw new AuthorizationError(`Forbidden: Action requires one of roles: [${allowedRoles.join(', ')}]`);
  }
}
