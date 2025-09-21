import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserPermissionsService } from 'app/modules/shared/services/user-permissions.service';

export const permissionGuard: CanActivateFn = (route, state) => {
  
  const userPermissionService = inject(UserPermissionsService);
  const router: Router = inject(Router);
  const requiredPermission = route?.data?.SCode as string;

  if(userPermissionService.isAddSectionAccessible(requiredPermission) || 
    userPermissionService.isEditSectionAccessible(requiredPermission) ||
    userPermissionService.isViewSectionAccessible(requiredPermission) ||
    userPermissionService.isDeleteSectionAccessible(requiredPermission)){
    return true
  }
  else{
    router.navigate(['/404-not-found'])
    return true;
  }
  return ;
};
