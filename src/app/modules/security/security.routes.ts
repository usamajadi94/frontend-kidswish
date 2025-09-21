import { Routes } from '@angular/router';
import { permissionGuard } from 'app/core/auth/guards/permission.guard';
import { componentRegister } from '../shared/services/component-register';

export default [
    {
        path: 'user-list',
        loadComponent: () => import('./components/users/users-list/users-list.component').then(m => m.UsersListComponent),
        data: { SCode: componentRegister.user.SCode },
        canActivate: [permissionGuard]
    },
    {
        path: 'group-list',
        loadComponent: () => import('./components/group/group-list/group-list.component').then(m => m.GroupListComponent),
        data: { SCode: componentRegister.group.SCode },
        canActivate: [permissionGuard]
    },
    {
        path: 'group-permission-list',
        loadComponent: () => import('./components/group-permission/group-permission-list/group-permission-list.component').then(m => m.GroupPermissionListComponent)
    },
] as Routes;
