import { Component, inject, OnInit } from '@angular/core';
import { BftButtonComponent } from 'app/modules/shared/components/buttons/bft-button/bft-button.component';
import { BftTableComponent } from 'app/modules/shared/components/tables/bft-table/bft-table.component';
import { componentRegister } from 'app/modules/shared/services/component-register';
import { ListService } from 'app/modules/shared/services/list.service';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { CompanyInformationComponent } from '../company-information-form.component';
import { BaseRoutedComponent } from 'app/core/Base/base-routed/base-routed.component';
import { WrapperAddComponent } from 'app/modules/shared/permission-wrapper/wrapper-add/wrapper-add.component';

@Component({
    selector: 'app-company-information-list',
    standalone: true,
    imports: [BftButtonComponent, BftTableComponent,WrapperAddComponent],
    templateUrl: './company-information-list.component.html',
    styleUrl: './company-information-list.component.scss',
})
export class CompanyInformationListComponent  extends BaseRoutedComponent implements OnInit {
    title = componentRegister.company.Title;
    private _listService = inject(ListService);
    private modalService = inject(ModalService);
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
            header: 'Phone No',
            name: 'PhoneNo',
            isSort: true,
            isFilterList: true,
            type: 'text',
        },
        {
            header: 'Email',
            name: 'Email',
            isSort: true,
            isFilterList: true,
            type: 'text',
        },
        {
            header: 'Rep Name',
            name: 'ContactPersonName',
            isSort: true,
            isFilterList: true,
            type: 'text',
        },
        {
            header: 'Rep Email',
            name: 'ContactPersonEmail',
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
        {
            header: 'Active',
            name: 'IsActive',
            isSort: true,
            isFilterList: true,
            type: 'status',
        },
    ];
    data = [];
    ngOnInit() {
        this.getData();
    }
    addCompanyInformation() {
        this.modalService
            .openModal({
                component: CompanyInformationComponent,
                title: this.title,
            })
            .afterClose.subscribe((res: boolean) => {
                if (res) {
                    this.getData();
                }
            });
    }

    getData() {
        this._listService.getCompanyInformation().subscribe({
            next: (res: any) => {
                this.data = res;
            },
            error: (err) => {
                console.error('Error fetching Company Information:', err);
            },
        });
    }

    onView(row) {
        this.modalService
            .openModal({
                component: CompanyInformationComponent,
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
