import { Component, inject, OnDestroy } from '@angular/core';
import { BftButtonComponent } from 'app/modules/shared/components/buttons/bft-button/bft-button.component';
import { BftTableComponent } from 'app/modules/shared/components/tables/bft-table/bft-table.component';
import { WrapperAddComponent } from 'app/modules/shared/permission-wrapper/wrapper-add/wrapper-add.component';
import { componentRegister } from 'app/modules/shared/services/component-register';
import { ListService } from 'app/modules/shared/services/list.service';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { ProductsFormComponent } from '../products-form.component';
import { BaseRoutedComponent } from 'app/core/Base/base-routed/base-routed.component';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-products-list',
    standalone: true,
    imports: [BftTableComponent, WrapperAddComponent, BftButtonComponent],
    templateUrl: './products-list.component.html',
    styleUrl: './products-list.component.scss',
})
export class ProductsListComponent extends BaseRoutedComponent implements OnDestroy {
    private modalService = inject(ModalService);
    private _listService = inject(ListService);
    title: string = componentRegister.product.Title;
    isVisible: boolean = false;
    private _destroy$ = new Subject<void>();
    columns = [
        {
            header: 'Product Name',
            name: 'Description',
            isSort: true,
            isFilterList: true,
            type: 'text',
        },
        {
            header: 'Category',
            name: 'ItemCategory',
            isSort: true,
            isFilterList: true,
            type: 'text',
        },
        {
            header: 'Flavors',
            name: 'FlavorCount',
            isSort: true,
            isFilterList: true,
            type: 'text',
        },
        {
            header: 'Modified By',
            name: 'ModifiedBy',
            isSort: true,
            isFilterList: true,
            type: 'text',
        },
        {
            header: 'Modified Date',
            name: 'ModifiedDate',
            isSort: true,
            isFilterList: true,
            type: 'date',
        },
        {
            header: 'Active',
            name: 'IsActive',
            isSort: true,
            isFilterList: true,
            type: 'status',
        },
    ];
    data = [];
    ngOnInit() {
        this.getData();
    }

    getData() {
        this._listService.getProduct().pipe(takeUntil(this._destroy$)).subscribe({
            next: (res: any) => {
                this.data = res;
            },
            error: (err) => {
                console.error('Error fetching products:', err);
            },
        });
    }

    onView(row) {
        this.modalService
            .openModal({
                component: ProductsFormComponent,
                title: this.title,
                ID: row.ID,
            })
            .afterClose.pipe(takeUntil(this._destroy$)).subscribe((res: boolean) => {
                if (res) {
                    this.getData();
                }
            });
    }

    addProduct() {
        this.modalService
            .openModal({
                component: ProductsFormComponent,
                title: componentRegister.product.Title,
                ID: null,
            })
            .afterClose.pipe(takeUntil(this._destroy$)).subscribe((res: boolean) => {
                if (res) {
                    this.getData();
                }
            });
    }

    ngOnDestroy(): void {
        this._destroy$.next();
        this._destroy$.complete();
    }
}
