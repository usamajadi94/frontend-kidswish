import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserPermissionsService } from 'app/modules/shared/services/user-permissions.service';
import { LoginUser } from 'app/core/user/user.types';

export const permissionGuard: CanActivateFn = (route) => {
  const userPermissionService = inject(UserPermissionsService);
  const router = inject(Router);
  const scode = route?.data?.SCode as string;

  // GlobalAdmin / Owner / Admin bypass all section-level permission checks
  const user = LoginUser.User;
  if (user) {
    const isTruthy = (v: any) => v === true || v === 1 || v === '1' || v?.[0] === 1;
    if (isTruthy(user.IsGlobalAdmin) || isTruthy(user.IsOwner) || isTruthy(user.IsAdmin)) {
      return true;
    }
  }

  // If no permissions loaded yet (empty SectionAccess), allow access
  if (!LoginUser.SectionAccess || LoginUser.SectionAccess.length === 0) return true;

  const hasAccess =
    userPermissionService.isViewSectionAccessible(scode) ||
    userPermissionService.isAddSectionAccessible(scode) ||
    userPermissionService.isEditSectionAccessible(scode) ||
    userPermissionService.isDeleteSectionAccessible(scode);

  if (hasAccess) return true;

  router.navigate(['/404-not-found']);
  return false;
};
