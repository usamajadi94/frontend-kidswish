import { Routes } from '@angular/router';
import { ExampleComponent } from './example.component';
import { ExampleTableComponent } from './example-table/example-table.component';

export default [
    {
        path     : '',
        component: ExampleComponent,
    },
    // {
    //     path     : '',
    //     component: ExampleTableComponent,
    // },
] as Routes;
