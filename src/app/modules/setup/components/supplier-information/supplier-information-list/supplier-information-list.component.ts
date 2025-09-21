import { Component, inject, OnInit } from '@angular/core';
import { BftButtonComponent } from 'app/modules/shared/components/buttons/bft-button/bft-button.component';
import { BftTableComponent } from 'app/modules/shared/components/tables/bft-table/bft-table.component';
import { ListService } from 'app/modules/shared/services/list.service';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { SupplierInformationComponent } from '../supplier-information-form.component';
import { componentRegister } from 'app/modules/shared/services/component-register';
import { BaseRoutedComponent } from 'app/core/Base/base-routed/base-routed.component';
import { WrapperAddComponent } from 'app/modules/shared/permission-wrapper/wrapper-add/wrapper-add.component';

@Component({
    selector: 'app-supplier-information-list',
    standalone: true,
    imports: [BftButtonComponent, BftTableComponent,WrapperAddComponent],
    templateUrl: './supplier-information-list.component.html',
    styleUrl: './supplier-information-list.component.scss',
})
export class SupplierInformationListComponent extends BaseRoutedComponent implements OnInit {
    private _listService = inject(ListService);
    private modalService = inject(ModalService);
    title: string = componentRegister.supplier.Title;
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
            header: 'Address',
            name: 'Address',
            isSort: true,
            isFilterList: true,
            type: 'text',
        },
        {
            header: 'Phone No',
            name: 'PhoneNo',
            isSort: true,
            isFilterList: true,
            type: 'text',
        },
        {
            header: 'Mobile No',
            name: 'MobileNo',
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

    ngOnInit() {
        this.getData();
    }

    addSupplierInformation() {
        this.modalService
            .openModal({
                component: SupplierInformationComponent,
                title: this.title,
            })
            .afterClose.subscribe((res: boolean) => {
                if (res) {
                    this.getData();
                }
            });
    }

    getData() {
        this._listService.getSupplierInformation().subscribe({
            next: (res: any) => {
                this.data = res;
            },
            error: (err) => {
                console.error('Error fetching Supplier Information:', err);
            },
        });
    }

    onView(row) {
        this.modalService
            .openModal({
                component: SupplierInformationComponent,
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
