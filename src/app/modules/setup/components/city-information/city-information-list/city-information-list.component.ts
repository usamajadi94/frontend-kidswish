import { Component, inject } from '@angular/core';
import { BftButtonComponent } from 'app/modules/shared/components/buttons/bft-button/bft-button.component';
import { BftTableComponent } from 'app/modules/shared/components/tables/bft-table/bft-table.component';
import { componentRegister } from 'app/modules/shared/services/component-register';
import { ListService } from 'app/modules/shared/services/list.service';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { CityInformationComponent } from '../city-information-form.component';
import { BaseRoutedComponent } from 'app/core/Base/base-routed/base-routed.component';
import { WrapperAddComponent } from 'app/modules/shared/permission-wrapper/wrapper-add/wrapper-add.component';

@Component({
    selector: 'app-city-information-list',
    standalone: true,
    imports: [BftButtonComponent, BftTableComponent,WrapperAddComponent],
    templateUrl: './city-information-list.component.html',
    styleUrl: './city-information-list.component.scss',
})
export class CityInformationListComponent extends BaseRoutedComponent{
    private modalService = inject(ModalService);
    private _listService = inject(ListService);
    title: string = componentRegister.city.Title;
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
        this._listService.getCityInformation().subscribe({
            next: (res: any) => {
                this.data = res;
            },
            error: (err) => {
                console.error('Error fetching City Information:', err);
            },
        });
    }

    onView(row) {
        this.modalService
            .openModal({
                component: CityInformationComponent,
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
                component: CityInformationComponent,
                title: this.title,
            })
            .afterClose.subscribe((res: boolean) => {
                if (res) {
                    this.getData();
                }
            });
    }
}
