import { Component, inject } from '@angular/core';
import { BillCollectionComponent } from '../bill-collection-form.component';
import { componentRegister } from 'app/modules/shared/services/component-register';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { ListService } from 'app/modules/shared/services/list.service';
import { BftButtonComponent } from 'app/modules/shared/components/buttons/bft-button/bft-button.component';
import { BftTableComponent } from 'app/modules/shared/components/tables/bft-table/bft-table.component';
import { BaseRoutedComponent } from 'app/core/Base/base-routed/base-routed.component';
import { WrapperAddComponent } from 'app/modules/shared/permission-wrapper/wrapper-add/wrapper-add.component';

@Component({
  selector: 'app-bill-collection-list',
  standalone: true,
  imports: [BftButtonComponent, BftTableComponent,WrapperAddComponent],
  templateUrl: './bill-collection-list.component.html',
  styleUrl: './bill-collection-list.component.scss'
})
export class BillCollectionListComponent extends BaseRoutedComponent{
private modalService = inject(ModalService);
    private _listService = inject(ListService);
    title: string = componentRegister.billCollection.Title;
    
    isVisible: boolean = false;
    data = [];
  columns = [
        {
            header: 'Code',
            name: 'Code',
            isSort: true,
            isFilterList: true,
            type: 'text',
        },
        {
            header: 'Name',
            name: 'Description',
            isSort: true,
            isFilterList: true,
            type: 'text',
        },
        {
            header: 'Business Name',
            name: 'BusinessName',
            isSort: true,
            isFilterList: true,
            type: 'text',
        },
        {
            header: 'Member Type',
            name: 'MemberType',
            isSort: true,
            isFilterList: true,
            type: 'text',
        },
        {
            header: 'Total Puchase',
            name: 'TotalPurchase',
            isSort: true,
            isFilterList: true,
            type: 'currency',
        },
        {
            header: 'Payment',
            name: 'Payment',
            isSort: true,
            isFilterList: true,
            type: 'currency',
        },
        {
            header: 'Closing Balance',
            name: 'ClosingBalance',
            isSort: true,
            isFilterList: true,
            type: 'currency',
        },
        {
            header: 'InActive',
            name: 'IsActive',
            isSort: true,
            isFilterList: true,
            type: 'status',
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
                component: BillCollectionComponent,
                title: this.title,
            })
            .afterClose.subscribe((res: boolean) => {
                if (res) {
                    this.getData();
                }
            });
    }

     getData() {
        this._listService.getCustomerInformation().subscribe({
            next: (res: any) => {
                this.data = res;
            },
            error: (err) => {
                console.error('Error fetching Area Information:', err);
            },
        });
    }

    onView(row) {
        this.modalService
            .openModal({
                component: BillCollectionComponent,
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
