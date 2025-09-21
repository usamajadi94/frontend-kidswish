import { Component, inject, OnInit } from '@angular/core';
import { BftButtonComponent } from 'app/modules/shared/components/buttons/bft-button/bft-button.component';
import { BftTableComponent } from 'app/modules/shared/components/tables/bft-table/bft-table.component';
import { componentRegister } from 'app/modules/shared/services/component-register';
import { ListService } from 'app/modules/shared/services/list.service';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { OpeningStockComponent } from '../opening-stock-form.component';
import { BaseRoutedComponent } from 'app/core/Base/base-routed/base-routed.component';
import { WrapperAddComponent } from 'app/modules/shared/permission-wrapper/wrapper-add/wrapper-add.component';

@Component({
    selector: 'app-opening-stock-list',
    standalone: true,
    imports: [BftTableComponent, BftButtonComponent,WrapperAddComponent],
    templateUrl: './opening-stock-list.component.html',
    styleUrl: './opening-stock-list.component.scss',
})
export class OpeningStockListComponent extends BaseRoutedComponent implements OnInit {
    private modalService = inject(ModalService);
    private _listService = inject(ListService);
    title: string = componentRegister.openingStock.Title;

    isVisible: boolean = false;
    data = [];
    columns = [
        {
            header: 'Date',
            name: 'Date',
            isSort: true,
            isFilterList: true,
            type: 'date',
        },
       
        {
            header: 'Item',
            name: 'Description',
            isSort: true,
            isFilterList: true,
            type: 'text',
        },
        {
            header: 'Updated Stock',
            name: 'StockUpdate',
            isSort: true,
            isFilterList: true,
            type: 'number',
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

    getData() {
        this._listService.getOpeningStock().subscribe({
            next: (res: any) => {
                this.data = res;
            },
            error: (err) => {
                console.error('Error fetching Opening Stock:', err);
            },
        });
    }

    addOpeningStock() {
        this.modalService
            .openModal({
                component: OpeningStockComponent,
                title: this.title,
            })
            .afterClose.subscribe((res: boolean) => {
                if (res) {
                    // this.getData();
                }
            });
    }

    onView(row) {
     this.modalService
        .openModal({
            component: OpeningStockComponent,
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
