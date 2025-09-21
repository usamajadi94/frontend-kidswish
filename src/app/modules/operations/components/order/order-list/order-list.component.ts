import { Component, inject } from '@angular/core';
import { BftButtonComponent } from 'app/modules/shared/components/buttons/bft-button/bft-button.component';
import { BftTableComponent } from 'app/modules/shared/components/tables/bft-table/bft-table.component';
import { componentRegister } from 'app/modules/shared/services/component-register';
import { ListService } from 'app/modules/shared/services/list.service';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { OrderComponent } from '../order.component-form';
import { DrpService } from 'app/modules/shared/services/drp.service';
import { lastValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { WrapperAddComponent } from 'app/modules/shared/permission-wrapper/wrapper-add/wrapper-add.component';
import { BaseRoutedComponent } from 'app/core/Base/base-routed/base-routed.component';

@Component({
  selector: 'app-order-list',
  standalone: true,
 imports: [BftButtonComponent, BftTableComponent,CommonModule,NzDropDownModule,WrapperAddComponent],
  templateUrl: './order-list.component.html',
  styleUrl: './order-list.component.scss'
})
export class OrderListComponent extends BaseRoutedComponent {
 private modalService = inject(ModalService);
    private _listService = inject(ListService);
    private _DrpService = inject(DrpService);
    title: string = componentRegister.order.Title;
    
    isVisible: boolean = false;
    data = [];
    columns = [
        {
            header: 'Order No',
            name: 'OrderNo',
            isSort: true,
            isFilterList: true,
            type: 'text',
        },
        {
            header: 'Order Date',
            name: 'OrderDate',
            isSort: true,
            isFilterList: true,
            type: 'date',
        },
        {
            header: 'Customer',
            name: 'Customer',
            isSort: true,
            isFilterList: true,
            type: 'text',
        },
        {
            header: 'Order Booker',
            name: 'OrderBooker',
            isSort: true,
            isFilterList: true,
            type: 'text',
        },
        {
            header: 'Net Amount',
            name: 'NetAmount',
            isSort: true,
            isFilterList: true,
            type: 'currency',
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
  itemCategories: any[] = [];

    async ngOnInit() {
        this.itemCategories = await lastValueFrom(this._DrpService.getItemCategories());
        this.getData();
    }

    addOrderInvoice(selectedCategoryID?:number) {
        this.modalService
            .openModal({
                component: OrderComponent,
                title: this.title,
                Data: { ItemCategoryID: selectedCategoryID }
            })
            .afterClose.subscribe((res: boolean) => {
                if (res) {
                    this.getData();
                }
            });
    }

    getData() {
        this._listService.getOrders().subscribe({
            next: (res: any) => {
                this.data = res;
            },
            error: (err) => {
                console.error('Error fetching Orders:', err);
            },
        });
    }

    onView(row) {
        this.modalService
            .openModal({
                component: OrderComponent,
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
