import { Component, inject, OnInit } from '@angular/core';
import { BftButtonComponent } from 'app/modules/shared/components/buttons/bft-button/bft-button.component';
import { BftTableComponent } from 'app/modules/shared/components/tables/bft-table/bft-table.component';
import { ListService } from 'app/modules/shared/services/list.service';
import { ExportService } from 'app/modules/shared/services/export.service';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { AccountTransferFormComponent } from '../account-transfer-form.component';
import { componentRegister } from 'app/modules/shared/services/component-register';
import { BaseRoutedComponent } from 'app/core/Base/base-routed/base-routed.component';
import { WrapperAddComponent } from 'app/modules/shared/permission-wrapper/wrapper-add/wrapper-add.component';

@Component({
    selector: 'app-transfer-list',
    standalone: true,
    imports: [BftButtonComponent, BftTableComponent, WrapperAddComponent],
    templateUrl: './transfer-list.component.html',
})
export class TransferListComponent extends BaseRoutedComponent implements OnInit {
    private modalService = inject(ModalService);
    private _listService = inject(ListService);
    private _exportService = inject(ExportService);
    title = componentRegister.accountTransfer.Title;
    isVisible = false;
    columns = [
        { header: 'Date', name: 'Date', isSort: true, isFilterList: true, type: 'date' },
        { header: 'Amount', name: 'Amount', isSort: true, isFilterList: true, type: 'currency' },
        { header: 'From Account', name: 'From', isSort: true, isFilterList: true, type: 'text' },
        { header: 'To Account', name: 'To', isSort: true, isFilterList: true, type: 'text' },
        { header: 'Transfer Method', name: 'PaymentType', isSort: true, isFilterList: true, type: 'text' },
        { header: 'Notes', name: 'Notes', isSort: true, isFilterList: true, type: 'text' },
        { header: 'Modified By', name: 'ModifiedBy', isSort: true, isFilterList: true, type: 'text' },
        { header: 'Modified Date', name: 'ModifiedDate', isSort: true, isFilterList: true, type: 'date' },
    ];
    data = [];

    ngOnInit() {
        this.getData();
    }

    getData() {
        this._listService.getAccountTransfer().subscribe({
            next: (res: any) => { this.data = res; },
        });
    }

    onView(row) {
        this.modalService.openModal({ component: AccountTransferFormComponent, title: 'Account Transfer', ID: row.ID }, 700)
            .afterClose.subscribe((res: boolean) => { if (res) this.getData(); });
    }

    add() {
        this.modalService.openModal({ component: AccountTransferFormComponent, title: 'Account Transfer' }, 700)
            .afterClose.subscribe((res: boolean) => { if (res) this.getData(); });
    }

    exportToExcel() {
        this._exportService.exportToExcel(this.columns, this.data, this.title);
    }
}
