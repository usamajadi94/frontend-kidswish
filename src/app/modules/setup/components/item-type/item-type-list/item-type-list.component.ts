import { Component, inject, OnInit } from '@angular/core';
import { BftButtonComponent } from 'app/modules/shared/components/buttons/bft-button/bft-button.component';
import { BftTableComponent } from 'app/modules/shared/components/tables/bft-table/bft-table.component';
import { ListService } from 'app/modules/shared/services/list.service';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { ItemTypeComponent } from '../item-type-form.component';
import { componentRegister } from 'app/modules/shared/services/component-register';
import { BaseRoutedComponent } from 'app/core/Base/base-routed/base-routed.component';
import { WrapperAddComponent } from 'app/modules/shared/permission-wrapper/wrapper-add/wrapper-add.component';

@Component({
    selector: 'app-item-type-list',
    standalone: true,
    imports: [BftButtonComponent, BftTableComponent,WrapperAddComponent],
    templateUrl: './item-type-list.component.html',
    styleUrl: './item-type-list.component.scss',
})
export class ItemTypeListComponent extends BaseRoutedComponent implements OnInit {
    private modalService = inject(ModalService);
    private _listService = inject(ListService);
    title: string  = componentRegister.itemType.Title;
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
    data = []
    ngOnInit() {
        this.getData();
    }

    getData() {
        this._listService.getItemType().subscribe({
            next: (res: any) => {
                this.data = res;
            },
            error: (err) => {
                console.error('Error fetching Item Type:', err);
            },
        });
    }

    onView(row) {
        this.modalService
            .openModal({
                component: ItemTypeComponent,
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
                component: ItemTypeComponent,
                title: this.title,
            })
            .afterClose.subscribe((res: boolean) => {
                if (res) {
                    this.getData();
                }
            });
    }
}
