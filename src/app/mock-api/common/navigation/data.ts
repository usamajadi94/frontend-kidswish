/* eslint-disable */
import { FuseNavigationItem } from '@fuse/components/navigation';

export const defaultNavigation: FuseNavigationItem[] = [
    
    {
        id: 'setup',
        title: 'Setup',
        subtitle: 'All Setup Form',
        type: 'group',
        icon: 'heroicons_outline:home',
        children: [
            {
                id: 'apps.ecommerce.inventory',
                icon: 'heroicons_outline:building-office-2',
                title: 'Company Information',
                type: 'basic',
                link: '/setup/company-list',
            },
            {
                id: 'apps.ecommerce.inventory',
                icon: 'heroicons_outline:truck',
                title: 'Supplier Information',
                type: 'basic',
                link: '/setup/supplier-list',
            },
            {
                id: 'apps.ecommerce.inventory',
                icon: 'heroicons_outline:shopping-bag',
                title: 'Item Type Information',
                type: 'basic',
                link: '/setup/item-type-list',
            },
            {
                id: 'apps.ecommerce.inventory',
                icon: 'heroicons_outline:squares-2x2',
                title: 'Item Profile Information',
                type: 'basic',
                link: '/setup/item-profile-list',
            },
            {
                id: 'apps.ecommerce.inventory',
                icon: 'heroicons_outline:home-modern',
                title: 'City Information',
                type: 'basic',
                link: '/setup/city-list',
            },
            {
                id: 'apps.ecommerce.inventory',
                icon: 'heroicons_outline:map',
                title: 'Area Information',
                type: 'basic',
                link: '/setup/area-list',
            },
            {
                id: 'apps.ecommerce.inventory',
                icon: 'heroicons_outline:user-circle',
                title: 'Member Type Information',
                type: 'basic',
                link: '/setup/member-type-list',
            },
            {
                id: 'apps.ecommerce.inventory',
                icon: 'heroicons_outline:arrow-path-rounded-square',
                title: 'Route Information',
                type: 'basic',
                link: '/setup/route-list',
            },
            {
                id: 'apps.ecommerce.inventory',
                icon: 'heroicons_outline:user-plus',
                title: 'Order Booker Information',
                type: 'basic',
                link: '/setup/order-booker-list',
            },
            {
                id: 'apps.ecommerce.inventory',
                icon: 'heroicons_outline:users',
                title: 'Customer Information',
                type: 'basic',
                link: '/setup/customer-list',
            },
            {
                id: 'apps.ecommerce.inventory',
                icon: 'heroicons_outline:identification',
                title: 'Salesman Information',
                type: 'basic',
                link: '/setup/salesman-list',
            },
            {
                id: 'apps.ecommerce.inventory',
                icon: 'heroicons_outline:cog',
                title: 'Vehicle Information',
                type: 'basic',
                link: '/setup/vehicle-list',
            },
            // {
            //     id: 'apps.ecommerce.inventory',
            //     icon: 'heroicons_outline:home',
            //     title: 'Days',
            //     type: 'basic',
            //     link: '/setup/days',
            // },
            // {
            //     id: 'apps.ecommerce.inventory',
            //     icon: 'heroicons_outline:home',
            //     title: 'Doctor Information',
            //     type: 'basic',
            //     link: '/setup/doctor-information',
            // },
            // {
            //     id: 'apps.ecommerce.inventory',
            //     icon: 'heroicons_outline:home',
            //     title: 'Doctor Specialization',
            //     type: 'basic',
            //     link: '/setup/doctor-specialization',
            // },
            // {
            //     id: 'apps.ecommerce.inventory',
            //     icon: 'heroicons_outline:home',
            //     title: 'Operation Department',
            //     type: 'basic',
            //     link: '/setup/operation-department',
            // },
            // {
            //     id: 'apps.ecommerce.inventory',
            //     icon: 'heroicons_outline:home',
            //     title: 'Patient Information',
            //     type: 'basic',
            //     link: '/setup/patient-information',
            // },
            // {
            //     id: 'apps.ecommerce.inventory',
            //     icon: 'heroicons_outline:home',
            //     title: 'Payment Method',
            //     type: 'basic',
            //     link: '/setup/payment-method',
            // },
            // {
            //     id: 'apps.ecommerce.inventory',
            //     icon: 'heroicons_outline:home',
            //     title: 'Relations',
            //     type: 'basic',
            //     link: '/setup/relations',
            // },
            // {
            //     id: 'apps.ecommerce.inventory',
            //     icon: 'heroicons_outline:home',
            //     title: 'Services & Price Information',
            //     type: 'basic',
            //     link: '/setup/services-price-information',
            // },
            // {
            //     id: 'apps.ecommerce.inventory',
            //     icon: 'heroicons_outline:home',
            //     title: 'Company Information',
            //     type: 'basic',
            //     link: '/setup/company-information',
            // },
        ],
    },
    
    {
        id: 'dms',
        title: 'DMS',
        type: 'group',
        icon: 'heroicons_outline:home',
        children: [
            {
                id: 'apps.ecommerce.inventory',
                icon: 'heroicons_outline:shopping-cart',
                title: 'Purchase Invoice',
                type: 'basic',
                link: '/dms/purhase-order-list',
            },
            {
                id: 'apps.ecommerce.inventory',
                icon: 'heroicons_outline:document-minus',
                title: 'Purchase Invoice Return',
                type: 'basic',
                link: '/dms/purhase-return-list',
            },
            {
                id: 'apps.ecommerce.inventory',
                icon: 'heroicons_outline:clipboard-document-check',
                title: 'Opening Stock',
                type: 'basic',
                link: '/dms/opening-stock-list',
            },
            {
                
                id: 'apps.ecommerce.inventory',
                icon: 'heroicons_outline:archive-box-arrow-down',
                title: 'Order',
                type: 'basic',
                link: '/dms/order-list',
            },
            {
                id: 'apps.ecommerce.inventory',
                icon: 'heroicons_outline:currency-dollar',
                title: 'Sale Invoice',
                type: 'basic',
                link: '/dms/sale-invoice-list',
            },
            {
                id: 'apps.ecommerce.inventory',
                icon: 'heroicons_outline:clipboard-document-list',
                title: 'Bill Collection',
                type: 'basic',
                link: '/dms/bill-collection-list',
            },
            {
                id: 'apps.ecommerce.inventory',
                icon: 'heroicons_outline:document-minus',
                title: 'Sale Invoice Return',
                type: 'basic',
                link: '/dms/sale-return-list',
            },
        
        ],
    },

    {
        id: 'report',
        title: 'Report',
        type: 'group',
        icon: 'heroicons_outline:home',
        children: [
             {
                id: 'apps.ecommerce.inventory',
                icon: 'heroicons_outline:currency-dollar',
                title: 'Sale Invoice',
                type: 'basic',
                link: '/report/sale-invoice',
            },
            {
                id: 'apps.ecommerce.inventory',
                icon: 'heroicons_outline:clipboard-document-list',
                title: 'Bill Collection',
                type: 'basic',
                link: '/report/bill-collection',
            },
            {
                id: 'apps.ecommerce.inventory',
                icon: 'heroicons_outline:shopping-cart',
                title: 'Purchase Invoice',
                type: 'basic',
                link: '/report/purchase-invoice',
            },
        
        ]
    }
    ,
    {
        id: 'security',
        title: 'Security',
        type: 'group',
        icon: 'heroicons_outline:lock',
        children: [
            {
                id: 'apps.ecommerce.inventory',
                icon: 'heroicons_outline:user-plus',
                title: 'Users',
                type: 'basic',
                link: '/security/user-list',
            },
            {
                id: 'apps.ecommerce.inventory',
                icon: 'heroicons_outline:user-group',
                title: 'Group',
                type: 'basic',
                link: '/security/group-list',
            },
            {
                id: 'apps.ecommerce.inventory',
                icon: 'heroicons_outline:lock-open',
                title: 'Group Permission',
                type: 'basic',
                link: '/security/group-permission-list',
            },
        ],
    },
    


    // {
    //     id: 'opd',
    //     title: 'OPD',
    //     subtitle: 'All OPD Form',
    //     type: 'group',
    //     icon: 'heroicons_outline:home',
    //     children: [
    //         {
    //             id: 'apps.opd',
    //             icon: 'heroicons_outline:home',
    //             title: 'Patient List',
    //             type: 'basic',
    //             link: '/opd/patient-list',
    //         },
    //         {
    //             id: 'apps.opd',
    //             icon: 'heroicons_outline:home',
    //             title: 'Booking List',
    //             type: 'basic',
    //             link: '/opd/booking-list',
    //         },
    //     ],
    // },
];
export const compactNavigation: FuseNavigationItem[] = [
    {
        id: 'setup',
        title: 'Setup',
        tooltip: 'Setup',
        type: 'aside',
        icon: 'heroicons_outline:bolt',
        children: [], // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
    },
    {
        id: 'dms',
        title: 'DMS',
        tooltip: 'DMS',
        type: 'aside',
        icon: 'heroicons_outline:swatch',
        children: [], // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
    },
    {
        id: 'report',
        title: 'Report',
        tooltip: 'Report',
        type: 'aside',
        icon: 'heroicons_outline:document-text',
        children: [], // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
    },
    {
        id: 'security',
        title: 'Security',
        tooltip: 'Security',
        type: 'aside',
        icon: 'heroicons_outline:lock-closed',
        children: [], // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
    },
    // {
    //     id: 'opd',
    //     title: 'OPD',
    //     subtitle: 'All OPD Form',
    //     type: 'aside',
    //     icon: 'heroicons_outline:home',
    //     children: [],
    // },
   
];
export const futuristicNavigation: FuseNavigationItem[] = [
    {
        id: 'example',
        title: 'Example',
        type: 'basic',
        icon: 'heroicons_outline:chart-pie',
        link: '/example',
    },
];
export const horizontalNavigation: FuseNavigationItem[] = [
    {
        id: 'example',
        title: 'Example',
        type: 'basic',
        icon: 'heroicons_outline:chart-pie',
        link: '/example',
    },

];
