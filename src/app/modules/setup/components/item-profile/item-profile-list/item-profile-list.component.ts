import { Component, OnInit, inject } from '@angular/core';
import { BftButtonComponent } from 'app/modules/shared/components/buttons/bft-button/bft-button.component';
import { BftTableComponent } from 'app/modules/shared/components/tables/bft-table/bft-table.component';
import { componentRegister } from 'app/modules/shared/services/component-register';
import { ListService } from 'app/modules/shared/services/list.service';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { ItemProfileComponent } from '../item-profile-form.component';
import { SetComponentRegisterService } from 'app/modules/setup/services/set-component-register.service';
import { BaseRoutedComponent } from 'app/core/Base/base-routed/base-routed.component';
import { WrapperAddComponent } from 'app/modules/shared/permission-wrapper/wrapper-add/wrapper-add.component';
import { WrapperUpdateComponent } from "app/modules/shared/permission-wrapper/wrapper-update/wrapper-update.component";

@Component({
    selector: 'app-item-profile-list',
    standalone: true,
    imports: [BftButtonComponent, BftTableComponent, WrapperAddComponent, WrapperUpdateComponent],
    templateUrl: './item-profile-list.component.html',
    styleUrl: './item-profile-list.component.scss',
})
export class ItemProfileListComponent extends BaseRoutedComponent implements OnInit {
    private modalService = inject(ModalService);
    private _listService = inject(ListService);
    private _setComponentRegisterService = inject(SetComponentRegisterService);

    ngOnInit() {
        this.getData();
    }

    title: string = componentRegister.itemProfile.Title;
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
            header: 'Description',
            name: 'Description',
            isSort: true,
            isFilterList: true,
            type: 'text',
        },
        {
            header: 'Company',
            name: 'CompanyName',
            isSort: true,
            isFilterList: true,
            type: 'text',
        },
        {
            header: 'Supplier',
            name: 'SupplierName',
            isSort: true,
            isFilterList: true,
            type: 'text',
        },
        {
            header: 'Stock In Hand',
            name: 'StockInHand',
            isSort: true,
            isFilterList: true,
            type: 'number',
        },
        {
            header: 'Cost Price',
            name: 'CostPr',
            isSort: true,
            isFilterList: true,
            type: 'currency',
        },
        // {
        //     header: 'Sale Price',
        //     name: 'SalePr',
        //     isSort: true,
        //     isFilterList: true,
        //     type: 'currency',
        // },
        // {
        //     header: 'Location',
        //     name: 'Location',
        //     isSort: true,
        //     isFilterList: true,
        //     type: 'text',
        // },
        {
            header: 'Category',
            name: 'CategoryName',
            isSort: true,
            isFilterList: true,
            type: 'text',
        },
       
        {
            header: 'Active',
            name: 'IsActive',
            isSort: true,
            isFilterList: true,
            type: 'status',
        },
    ];
    data: any[] = [];

    getData() {
        this._listService.getItemProfile().subscribe({
            next: (res: any) => {
                this.data = res;
            },
            error: (err) => {
                console.error('Error fetching Item Profile:', err);
            },
        });
    }

    onView(row: any) {
        this.modalService
            .openModal({
                component: ItemProfileComponent,
                title: this.title,
                ID: row.ID,
            })
            .afterClose.subscribe((res: boolean) => {
                if (res) this.getData();
            });
    }

    addItemProfile() {
        this.modalService
            .openModal({
                component: ItemProfileComponent,
                title: this.title,
            })
            .afterClose.subscribe((res: boolean) => {
                if (res) this.getData();
            });
    }

    addMultipleItemProfile() {
        this._setComponentRegisterService.addMultipleItemPricing().subscribe(res => {
            if (res) this.getData();
        })
    }

    
}
