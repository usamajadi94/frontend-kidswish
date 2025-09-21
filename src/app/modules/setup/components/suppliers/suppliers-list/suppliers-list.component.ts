import { Component, inject, OnInit } from '@angular/core';
import { BftTableComponent } from "app/modules/shared/components/tables/bft-table/bft-table.component";
import { WrapperAddComponent } from "app/modules/shared/permission-wrapper/wrapper-add/wrapper-add.component";
import { BftButtonComponent } from "app/modules/shared/components/buttons/bft-button/bft-button.component";
import { ModalService } from 'app/modules/shared/services/modal.service';
import { SuppliersFormComponent } from '../suppliers-form.component';
import { BaseRoutedComponent } from 'app/core/Base/base-routed/base-routed.component';
import { componentRegister } from 'app/modules/shared/services/component-register';
import { ListService } from 'app/modules/shared/services/list.service';
import { SupplierInformationComponent } from '../../supplier-information/supplier-information-form.component';

@Component({
  selector: 'app-suppliers-list',
  standalone: true,
  imports: [BftTableComponent, WrapperAddComponent, BftButtonComponent],
  templateUrl: './suppliers-list.component.html',
  styleUrl: './suppliers-list.component.scss'
})
export class SuppliersListComponent extends BaseRoutedComponent implements OnInit {
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
            type: 'pNumber',
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
                component: SuppliersFormComponent,
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
                component: SuppliersFormComponent,
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

