import { Component, inject, OnInit } from '@angular/core';
import { BftButtonComponent } from 'app/modules/shared/components/buttons/bft-button/bft-button.component';
import { BftTableComponent } from 'app/modules/shared/components/tables/bft-table/bft-table.component';
import { ListService } from 'app/modules/shared/services/list.service';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { PaymentReceivedFormComponent } from '../payment-received-form.component';
import { componentRegister } from 'app/modules/shared/services/component-register';
import { BaseRoutedComponent } from 'app/core/Base/base-routed/base-routed.component';
import { WrapperAddComponent } from 'app/modules/shared/permission-wrapper/wrapper-add/wrapper-add.component';

@Component({
    selector: 'app-payment-received-list',
    standalone: true,
    imports: [BftButtonComponent, BftTableComponent, WrapperAddComponent],
    templateUrl: './payment-received-list.component.html',
    styleUrl: './payment-received-list.component.scss',
})
export class PaymentReceivedListComponent extends BaseRoutedComponent implements OnInit {
    private modalService = inject(ModalService);
    private _listService = inject(ListService);
    title = componentRegister.paymentReceived.Title;
    isVisible = false;
    columns = [
        { header: 'Date', name: 'Date', isSort: true, isFilterList: true, type: 'date' },
        { header: 'Amount', name: 'Amount', isSort: true, isFilterList: true, type: 'currency' },
        { header: 'Payment Type', name: 'PaymentType', isSort: true, isFilterList: true, type: 'text' },
        { header: 'From', name: 'From', isSort: true, isFilterList: true, type: 'text' },
        { header: 'To', name: 'To', isSort: true, isFilterList: true, type: 'text' },
        { header: 'Modified By', name: 'ModifiedBy', isSort: true, isFilterList: true, type: 'text' },
        { header: 'Modified Date', name: 'ModifiedDate', isSort: true, isFilterList: true, type: 'date' },
    ];
    data = [];

    ngOnInit() {
        this.getData();
    }

    getData() {
        this._listService.getPaymentReceived().subscribe({
            next: (res: any) => { this.data = res; },
        });
    }

    onView(row) {
        this.modalService.openModal({ component: PaymentReceivedFormComponent, title: this.title, ID: row.ID })
            .afterClose.subscribe((res: boolean) => { if (res) this.getData(); });
    }

    add() {
        this.modalService.openModal({ component: PaymentReceivedFormComponent, title: this.title })
            .afterClose.subscribe((res: boolean) => { if (res) this.getData(); });
    }
}
