import { Component, inject } from '@angular/core';
import { BftButtonComponent } from 'app/modules/shared/components/buttons/bft-button/bft-button.component';
import { BftTableComponent } from 'app/modules/shared/components/tables/bft-table/bft-table.component';
import { componentRegister } from 'app/modules/shared/services/component-register';
import { ListService } from 'app/modules/shared/services/list.service';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { CustomerInformationComponent } from '../customer-information-form.component';
import { BaseRoutedComponent } from 'app/core/Base/base-routed/base-routed.component';
import { WrapperAddComponent } from 'app/modules/shared/permission-wrapper/wrapper-add/wrapper-add.component';

@Component({
  selector: 'app-customer-information-list',
  standalone: true,
  imports: [BftButtonComponent, BftTableComponent,WrapperAddComponent],
  templateUrl: './customer-information-list.component.html',
  styleUrl: './customer-information-list.component.scss'
})
export class CustomerInformationListComponent extends BaseRoutedComponent{
 private modalService = inject(ModalService);
    private _listService = inject(ListService);
    title: string = componentRegister.customer.Title;
    isVisible: boolean = false;
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
            header: 'Active',
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
    data = [];

    ngOnInit() {
        this.getData();
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
                component: CustomerInformationComponent,
                title: this.title,
                ID: row.ID,
            })
            .afterClose.subscribe((res: boolean) => {
                if (res) {
                    this.getData();
                }
            });
    }

    addItemType() {
        this.modalService
            .openModal({
                component: CustomerInformationComponent,
                title: this.title,
            })
            .afterClose.subscribe((res: boolean) => {
                if (res) {
                    this.getData();
                }
            });
    }
}
