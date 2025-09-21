import { Route } from '@angular/router';
import { initialDataResolver } from 'app/app.resolvers';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';
import { NoAuthGuard } from 'app/core/auth/guards/noAuth.guard';
import { LayoutComponent } from 'app/layout/layout.component';

// prettier-ignore
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
export const appRoutes: Route[] = [

    // Redirect empty path to '/dashboards/project'
    {path: '', pathMatch : 'full', redirectTo: 'pages/settings'},

    // Redirect signed-in user to the '/dashboards/project'
    //
    // After the user signs in, the sign-in page will redirect the user to the 'signed-in-redirect'
    // path. Below is another redirection for that path to redirect the user to the desired
    // location. This is a small convenience to keep all main routes together here on this file.
    {
        path: 'signed-in-redirect',
        pathMatch : 'full',
        redirectTo: 'example'
    },

    // Auth routes for guests
    {
        path: '',
        canActivate: [NoAuthGuard],
        canActivateChild: [NoAuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            {path: 'confirmation-required', loadChildren: () => import('app/modules/auth/confirmation-required/confirmation-required.routes')},
            {path: 'forgot-password', loadChildren: () => import('app/modules/auth/forgot-password/forgot-password.routes')},
            {path: 'reset-password', loadChildren: () => import('app/modules/auth/reset-password/reset-password.routes')},
            {path: 'sign-in', loadChildren: () => import('app/modules/auth/sign-in/sign-in.routes')},
           
            {path: 'sign-up', loadChildren: () => import('app/modules/auth/sign-up/sign-up.routes')}
        ]
    },

    // Auth routes for authenticated users
    {
        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            {path: 'sign-out', loadChildren: () => import('app/modules/auth/sign-out/sign-out.routes')},
            {path: 'unlock-session', loadChildren: () => import('app/modules/auth/unlock-session/unlock-session.routes')}
        ]
    },

    // Landing routes
    {
        path: '',
        component: LayoutComponent,
        data: {
            layout: 'modern'
        },
        children: [
            {path: 'switch-entity', loadChildren: () => import('app/modules/auth/switch-entity/switch-entity.routes')},
            {path: 'change-password', loadChildren: () => import('app/modules/auth/change-password/change-password.routes')},
            // {path: 'home', loadChildren: () => import('app/modules/landing/home/home.routes')},
        ]
    },

    // Admin routes
    {
        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        resolve: {
            initialData: initialDataResolver
        },
        children: [
            {path: 'example', loadChildren: () => import('app/modules/admin/example/example.routes')},
            {path: 'home', loadChildren: () => import('app/modules/landing/home/home.routes')},
            {path: 'setup', loadChildren: () => import('app/modules/setup/setup.routes')},
            {path: 'dms', loadChildren: () => import('app/modules/operations/operation.route')},
            {path: 'report', loadChildren: () => import('app/modules/reports-generator/report.routes')},
            {path: 'security', loadChildren: () => import('app/modules/security/security.routes')},
            {path: 'main', loadChildren: () => import('app/modules/main/main.routes')},

            // Pages
            {path: 'pages', children: [

               

                // Authentication
                {path: 'authentication', loadChildren: () => import('app/modules/admin/pages/authentication/authentication.routes')},

                // Coming Soon
                {path: 'coming-soon', loadChildren: () => import('app/modules/admin/pages/coming-soon/coming-soon.routes')},

                // Error
                {path: 'error', children: [
                    {path: '404', loadChildren: () => import('app/modules/admin/pages/error/error-404/error-404.routes')},
                    {path: '500', loadChildren: () => import('app/modules/admin/pages/error/error-500/error-500.routes')}
                ]},

               

                // Maintenance
                {path: 'maintenance', loadChildren: () => import('app/modules/admin/pages/maintenance/maintenance.routes')},

               

                // Profile
                {path: 'profile', loadChildren: () => import('app/modules/admin/pages/profile/profile.routes')},

                // Settings
                {path: 'settings', loadChildren: () => import('app/modules/admin/pages/settings/settings.routes')},
            ]},

          

            // 404 & Catch all
            {path: '404-not-found', pathMatch: 'full', loadChildren: () => import('app/modules/admin/pages/error/error-404/error-404.routes')},
            {path: '**', redirectTo: '404-not-found'}
        ]
    }
];
