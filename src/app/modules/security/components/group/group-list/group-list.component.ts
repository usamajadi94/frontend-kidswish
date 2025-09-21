import { Component, inject } from '@angular/core';
// import { UsersFormComponent } from '../../users/users-form.component';
import { componentRegister } from 'app/modules/shared/services/component-register';
import { ListService } from 'app/modules/shared/services/list.service';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { BftTableComponent } from "../../../../shared/components/tables/bft-table/bft-table.component";
import { BftButtonComponent } from "../../../../shared/components/buttons/bft-button/bft-button.component";
import { GroupFormsComponent } from '../group-forms.component';
import { WrapperAddComponent } from 'app/modules/shared/permission-wrapper/wrapper-add/wrapper-add.component';
import { BaseRoutedComponent } from 'app/core/Base/base-routed/base-routed.component';

@Component({
  selector: 'app-group-list',
  standalone: true,
  imports: [BftTableComponent, BftButtonComponent,WrapperAddComponent],
  templateUrl: './group-list.component.html',
  styleUrl: './group-list.component.scss'
})
export class GroupListComponent extends BaseRoutedComponent {

  private modalService = inject(ModalService);
    private _listService = inject(ListService);
    title: string = componentRegister.group.Title;

    isVisible: boolean = false;
    data = [];
    columns = [
        {
            header: 'Group Name',
            name: 'Name',
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

    ngOnInit() {
        this.getData();
    }

    getData() {
        this._listService.getGroups().subscribe({
            next: (res: any) => {
                this.data = res;
            },
            error: (err) => {
                console.error('Error fetching Opening Stock:', err);
            },
        });
    }

    addGroup() {
        this.modalService
            .openModal({
                component: GroupFormsComponent,
                title: this.title,
            })
            .afterClose.subscribe((res: boolean) => {
                if (res) {
                    this.getData();
                }
            });
    }

    onView(row) {
        if(row.IsAdmin != true){
            this.modalService
            .openModal({
                component: GroupFormsComponent,
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
}






