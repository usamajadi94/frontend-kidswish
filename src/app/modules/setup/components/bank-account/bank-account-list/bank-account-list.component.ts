import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BftButtonComponent } from 'app/modules/shared/components/buttons/bft-button/bft-button.component';
import { BftTableComponent } from 'app/modules/shared/components/tables/bft-table/bft-table.component';
import { ListService } from 'app/modules/shared/services/list.service';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { BankAccountFormComponent } from '../bank-account-form.component';
import { AccountTransferFormComponent } from '../account-transfer-form.component';
import { componentRegister } from 'app/modules/shared/services/component-register';
import { BaseRoutedComponent } from 'app/core/Base/base-routed/base-routed.component';
import { WrapperAddComponent } from 'app/modules/shared/permission-wrapper/wrapper-add/wrapper-add.component';
import { ToastService } from 'app/core/toaster/toast.service';

@Component({
    selector: 'app-bank-account-list',
    standalone: true,
    imports: [BftButtonComponent, BftTableComponent, WrapperAddComponent],
    templateUrl: './bank-account-list.component.html',
    styleUrl: './bank-account-list.component.scss',
})
export class BankAccountListComponent extends BaseRoutedComponent implements OnInit {
    private modalService = inject(ModalService);
    private _listService = inject(ListService);
    private _toastService = inject(ToastService);
    private _router = inject(Router);
    title = componentRegister.bankAccount.Title;
    isVisible = false;
    columns = [
        { header: 'Account Name', name: 'Name', isSort: true, isFilterList: true, type: 'text' },
        { header: 'Type', name: 'Type', isSort: true, isFilterList: true, type: 'text' },
        { header: 'Account Holder', name: 'Owner', isSort: true, isFilterList: true, type: 'text' },
        { header: 'Opening Balance', name: 'OpeningBalance', isSort: true, isFilterList: true, type: 'currency' },
        { header: 'Current Balance', name: 'Balance', isSort: true, isFilterList: true, type: 'currency' },
        { header: 'Modified By', name: 'ModifiedBy', isSort: true, isFilterList: true, type: 'text' },
        { header: 'Modified Date', name: 'ModifiedDate', isSort: true, isFilterList: true, type: 'date' },
    ];
    data = [];

    ngOnInit() {
        this.getData();
    }

    getData() {
        this._listService.getBankAccount().subscribe({
            next: (res: any) => { this.data = res; },
            error: (err) => { this._toastService.openResult(err.status); },
        });
    }

    onView(row) {
        this._router.navigate(['/setup/bank-account-detail', row.ID]);
    }

    addBankAccount() {
        this.modalService.openModal({ component: BankAccountFormComponent, title: this.title })
            .afterClose.subscribe((res: boolean) => { if (res) this.getData(); });
    }

    openTransfer() {
        this.modalService.openModal({ component: AccountTransferFormComponent, title: 'Account Transfer' }, 700)
            .afterClose.subscribe((res: boolean) => { if (res) this.getData(); });
    }
}
