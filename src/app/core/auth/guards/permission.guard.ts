import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserPermissionsService } from 'app/modules/shared/services/user-permissions.service';

export const permissionGuard: CanActivateFn = (route) => {
  const userPermissionService = inject(UserPermissionsService);
  const router = inject(Router);
  const scode = route?.data?.SCode as string;

  const hasAccess =
    userPermissionService.isViewSectionAccessible(scode) ||
    userPermissionService.isAddSectionAccessible(scode) ||
    userPermissionService.isEditSectionAccessible(scode) ||
    userPermissionService.isDeleteSectionAccessible(scode);

  if (hasAccess) return true;

  router.navigate(['/404-not-found']);
  return false;
};
