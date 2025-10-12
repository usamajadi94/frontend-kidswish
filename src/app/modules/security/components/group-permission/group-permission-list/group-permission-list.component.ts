import { Component, inject } from '@angular/core';
import { componentRegister } from 'app/modules/shared/services/component-register';
import { ListService } from 'app/modules/shared/services/list.service';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { BftTableComponent } from "../../../../shared/components/tables/bft-table/bft-table.component";
import { BftButtonComponent } from "../../../../shared/components/buttons/bft-button/bft-button.component";
import { GroupPermissionComponent } from '../group-permission.component';

@Component({
  selector: 'app-group-permission-list',
  standalone: true,
  imports: [BftTableComponent, BftButtonComponent],
  templateUrl: './group-permission-list.component.html',
  styleUrl: './group-permission-list.component.scss'
})
export class GroupPermissionListComponent{
private modalService = inject(ModalService);
    private _listService = inject(ListService);
    title: string = componentRegister.groupPermission;

    isVisible: boolean = false;
    data = [];
    columns = [
        {
            header: 'Group Name',
            name: 'GroupName',
            isSort: true,
            isFilterList: true,
            type: 'text',
        },
       
        {
            header: 'Modules',
            name: 'Modules',
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

    ngOnInit() {
        this.getData();
    }

    getData() {
        
    }


    addUser() {
        this.modalService
            .openModal({
                component: GroupPermissionComponent,
                title: this.title,
            })
            .afterClose.subscribe((res: boolean) => {
                if (res) {
                    // this.getData();
                }
            });
    }

    onView(row) {
   
    }
}

