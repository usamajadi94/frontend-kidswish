import { Component, inject, OnInit } from '@angular/core';
import { BftButtonComponent } from 'app/modules/shared/components/buttons/bft-button/bft-button.component';
import { BftTableComponent } from 'app/modules/shared/components/tables/bft-table/bft-table.component';
import { ListService } from 'app/modules/shared/services/list.service';
import { ExportService } from 'app/modules/shared/services/export.service';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { RawMaterialFormComponent } from '../raw-material-form.component';
import { componentRegister } from 'app/modules/shared/services/component-register';
import { BaseRoutedComponent } from 'app/core/Base/base-routed/base-routed.component';
import { WrapperAddComponent } from 'app/modules/shared/permission-wrapper/wrapper-add/wrapper-add.component';

@Component({
    selector: 'app-raw-material-list',
    standalone: true,
    imports: [BftButtonComponent, BftTableComponent, WrapperAddComponent],
    templateUrl: './raw-material-list.component.html',
    styleUrl: './raw-material-list.component.scss',
})
export class RawMaterialListComponent extends BaseRoutedComponent implements OnInit {
    private modalService = inject(ModalService);
    private _listService = inject(ListService);
    private _exportService = inject(ExportService);
    title = componentRegister.rawMaterial.Title;
    isVisible = false;
    columns = [
        { header: 'Name', name: 'Name', isSort: true, isFilterList: true, type: 'text' },
        { header: 'Unit', name: 'UnitName', isSort: true, isFilterList: true, type: 'text' },
        { header: 'Active', name: 'IsActive', isSort: true, isFilterList: true, type: 'status' },
        { header: 'Modified By', name: 'ModifiedBy', isSort: true, isFilterList: true, type: 'text' },
        { header: 'Modified Date', name: 'ModifiedDate', isSort: true, isFilterList: true, type: 'date' },
    ];
    data = [];

    ngOnInit() {
        this.getData();
    }

    getData() {
        this._listService.getRawMaterial().subscribe({
            next: (res: any) => { this.data = res; },
        });
    }

    onView(row) {
        this.modalService.openModal({ component: RawMaterialFormComponent, title: this.title, ID: row.ID })
            .afterClose.subscribe((res: boolean) => { if (res) this.getData(); });
    }

    addRawMaterial() {
        this.modalService.openModal({ component: RawMaterialFormComponent, title: this.title })
            .afterClose.subscribe((res: boolean) => { if (res) this.getData(); });
    }

    exportToExcel() {
        this._exportService.exportToExcel(this.columns, this.data, this.title);
    }
}
