import { Component, inject, OnInit } from '@angular/core';
import { BftButtonComponent } from 'app/modules/shared/components/buttons/bft-button/bft-button.component';
import { BftTableComponent } from 'app/modules/shared/components/tables/bft-table/bft-table.component';
import { ListService } from 'app/modules/shared/services/list.service';
import { ExportService } from 'app/modules/shared/services/export.service';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { SupplierFormComponent } from '../supplier-form.component';
import { componentRegister } from 'app/modules/shared/services/component-register';
import { BaseRoutedComponent } from 'app/core/Base/base-routed/base-routed.component';
import { WrapperAddComponent } from 'app/modules/shared/permission-wrapper/wrapper-add/wrapper-add.component';

@Component({
    selector: 'app-supplier-list',
    standalone: true,
    imports: [BftButtonComponent, BftTableComponent, WrapperAddComponent],
    templateUrl: './supplier-list.component.html',
    styleUrl: './supplier-list.component.scss',
})
export class SupplierListComponent extends BaseRoutedComponent implements OnInit {
    private modalService = inject(ModalService);
    private _listService = inject(ListService);
    private _exportService = inject(ExportService);
    title = componentRegister.supplier.Title;
    isVisible = false;
    columns = [
        { header: 'Name', name: 'Name', isSort: true, isFilterList: true, type: 'text' },
        { header: 'Contact Name', name: 'ContactName', isSort: true, isFilterList: true, type: 'text' },
        { header: 'Phone No', name: 'PhoneNo', isSort: true, isFilterList: true, type: 'text' },
        { header: 'Opening Balance', name: 'OpeningBalance', isSort: true, isFilterList: true, type: 'currency' },
        { header: 'Active', name: 'IsActive', isSort: true, isFilterList: true, type: 'status' },
        { header: 'Modified By', name: 'ModifiedBy', isSort: true, isFilterList: true, type: 'text' },
        { header: 'Modified Date', name: 'ModifiedDate', isSort: true, isFilterList: true, type: 'date' },
    ];
    data = [];

    ngOnInit() {
        this.getData();
    }

    getData() {
        this._listService.getSupplier().subscribe({
            next: (res: any) => { this.data = res; },
        });
    }

    onView(row) {
        this.modalService.openModal({ component: SupplierFormComponent, title: this.title, ID: row.ID })
            .afterClose.subscribe((res: boolean) => { if (res) this.getData(); });
    }

    addSupplier() {
        this.modalService.openModal({ component: SupplierFormComponent, title: this.title })
            .afterClose.subscribe((res: boolean) => { if (res) this.getData(); });
    }

    exportToExcel() {
        this._exportService.exportToExcel(this.columns, this.data, this.title);
    }
}
