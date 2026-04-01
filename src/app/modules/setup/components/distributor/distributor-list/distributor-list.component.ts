import { Component, inject, OnInit } from '@angular/core';
import { BftButtonComponent } from 'app/modules/shared/components/buttons/bft-button/bft-button.component';
import { BftTableComponent } from 'app/modules/shared/components/tables/bft-table/bft-table.component';
import { ListService } from 'app/modules/shared/services/list.service';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { DistributorFormComponent } from '../distributor-form.component';
import { componentRegister } from 'app/modules/shared/services/component-register';
import { BaseRoutedComponent } from 'app/core/Base/base-routed/base-routed.component';
import { WrapperAddComponent } from 'app/modules/shared/permission-wrapper/wrapper-add/wrapper-add.component';

@Component({
    selector: 'app-distributor-list',
    standalone: true,
    imports: [BftButtonComponent, BftTableComponent, WrapperAddComponent],
    templateUrl: './distributor-list.component.html',
    styleUrl: './distributor-list.component.scss',
})
export class DistributorListComponent extends BaseRoutedComponent implements OnInit {
    private modalService = inject(ModalService);
    private _listService = inject(ListService);
    title = componentRegister.distributor.Title;
    isVisible = false;
    columns = [
        { header: 'Name', name: 'Name', isSort: true, isFilterList: true, type: 'text' },
        { header: 'Phone No', name: 'PhoneNo', isSort: true, isFilterList: true, type: 'text' },
        { header: 'City', name: 'City', isSort: true, isFilterList: true, type: 'text' },
        { header: 'Address', name: 'Address', isSort: true, isFilterList: true, type: 'text' },
        { header: 'Active', name: 'IsActive', isSort: true, isFilterList: true, type: 'status' },
        { header: 'Modified By', name: 'ModifiedBy', isSort: true, isFilterList: true, type: 'text' },
        { header: 'Modified Date', name: 'ModifiedDate', isSort: true, isFilterList: true, type: 'date' },
    ];
    data = [];

    ngOnInit() {
        this.getData();
    }

    getData() {
        this._listService.getDistributor().subscribe({
            next: (res: any) => { this.data = res; },
        });
    }

    onView(row) {
        this.modalService.openModal({ component: DistributorFormComponent, title: this.title, ID: row.ID })
            .afterClose.subscribe((res: boolean) => { if (res) this.getData(); });
    }

    addDistributor() {
        this.modalService.openModal({ component: DistributorFormComponent, title: this.title })
            .afterClose.subscribe((res: boolean) => { if (res) this.getData(); });
    }
}
