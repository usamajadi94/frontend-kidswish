import { Component, inject } from '@angular/core';
import { BftButtonComponent } from 'app/modules/shared/components/buttons/bft-button/bft-button.component';
import { BftTableComponent } from 'app/modules/shared/components/tables/bft-table/bft-table.component';
import { componentRegister } from 'app/modules/shared/services/component-register';
import { ListService } from 'app/modules/shared/services/list.service';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { PurchaseInvoiceComponent } from '../purchase-invoice-form.component';
import { WrapperAddComponent } from 'app/modules/shared/permission-wrapper/wrapper-add/wrapper-add.component';
import { BaseRoutedComponent } from 'app/core/Base/base-routed/base-routed.component';

@Component({
    selector: 'app-purchase-invoice-list',
    standalone: true,
    imports: [BftButtonComponent, BftTableComponent,WrapperAddComponent],
    templateUrl: './purchase-invoice-list.component.html',
    styleUrl: './purchase-invoice-list.component.scss',
})
export class PurchaseInvoiceListComponent extends BaseRoutedComponent{
    private modalService = inject(ModalService);
    private _listService = inject(ListService);
    title: string = componentRegister.purchaseInvoice.Title;
    
    isVisible: boolean = false;
    data = [];
    columns = [
        {
            header: 'Invoice No',
            name: 'InvoiceNo',
            isSort: true,
            isFilterList: true,
            type: 'text',
        },
        {
            header: 'Invoice Date',
            name: 'InvoiceDate',
            isSort: true,
            isFilterList: true,
            type: 'date',
        },
        {
            header: 'Supplier Name',
            name: 'SupplierName',
            isSort: true,
            isFilterList: true,
            type: 'text',
        },
        {
            header: 'Category Name',
            name: 'CategoryName',
            isSort: true,
            isFilterList: true,
            type: 'text',
        },
        {
            header: 'Company Name',
            name: 'CompanyName',
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
    ];

    ngOnInit() {
        this.getData();
    }

    addPurchaseInvoice() {
        this.modalService
            .openModal({
                component: PurchaseInvoiceComponent,
                title: this.title,
            })
            .afterClose.subscribe((res: boolean) => {
                if (res) {
                    this.getData();
                }
            });
    }

    getData() {
        this._listService.getPurchaseInvoice().subscribe({
            next: (res: any) => {
                this.data = res;
            },
            error: (err) => {
                console.error('Error fetching Purchase Invoice:', err);
            },
        });
    }

    onView(row) {
        this.modalService
            .openModal({
                component: PurchaseInvoiceComponent,
                title: this.title,
                ID: row.ID,
            })
            .afterClose.subscribe((res: boolean) => {
                if (res) {
                    this.getData();
                }
            });
    }
}
