import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BftButtonComponent } from 'app/modules/shared/components/buttons/bft-button/bft-button.component';
import { BftTableComponent } from 'app/modules/shared/components/tables/bft-table/bft-table.component';
import { ListService } from 'app/modules/shared/services/list.service';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { PettyCashFormComponent } from '../petty-cash-form.component';
import { PettyCashFundComponent } from '../petty-cash-fund.component';
import { componentRegister } from 'app/modules/shared/services/component-register';
import { BaseRoutedComponent } from 'app/core/Base/base-routed/base-routed.component';
import { WrapperAddComponent } from 'app/modules/shared/permission-wrapper/wrapper-add/wrapper-add.component';

@Component({
    selector: 'app-petty-cash-list',
    standalone: true,
    imports: [BftButtonComponent, BftTableComponent, WrapperAddComponent],
    templateUrl: './petty-cash-list.component.html',
    styleUrl: './petty-cash-list.component.scss',
})
export class PettyCashListComponent extends BaseRoutedComponent implements OnInit {
    private modalService = inject(ModalService);
    private _listService = inject(ListService);
    private _router = inject(Router);
    title = componentRegister.pettyCash.Title;
    isVisible = false;
    columns = [
        { header: 'Name', name: 'Name', isSort: true, isFilterList: true, type: 'text' },
        { header: 'Total Funded', name: 'TotalFunded', isSort: true, isFilterList: true, type: 'currency' },
        { header: 'Total Expenses', name: 'TotalExpenses', isSort: true, isFilterList: true, type: 'currency' },
        { header: 'Balance (PKR)', name: 'Balance', isSort: true, isFilterList: true, type: 'currency' },
        { header: 'Modified By', name: 'ModifiedBy', isSort: true, isFilterList: true, type: 'text' },
        { header: 'Modified Date', name: 'ModifiedDate', isSort: true, isFilterList: true, type: 'date' },
    ];
    data = [];

    ngOnInit() {
        this.getData();
    }

    getData() {
        this._listService.getPettyCash().subscribe({
            next: (res: any) => { this.data = res; },
        });
    }

    onView(row) {
        this._router.navigate(['/setup/petty-cash-detail', row.ID]);
    }

    openAddFunds() {
        this.modalService.openModal({ component: PettyCashFundComponent, title: 'Add Funds to Petty Cash' }, 700)
            .afterClose.subscribe((res: boolean) => { if (res) this.getData(); });
    }

    addPettyCash() {
        this.modalService.openModal({ component: PettyCashFormComponent, title: this.title })
            .afterClose.subscribe((res: boolean) => { if (res) this.getData(); });
    }
}
