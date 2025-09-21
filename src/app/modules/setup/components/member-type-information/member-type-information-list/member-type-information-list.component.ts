import { Component, inject } from '@angular/core';
import { BftButtonComponent } from 'app/modules/shared/components/buttons/bft-button/bft-button.component';
import { BftTableComponent } from 'app/modules/shared/components/tables/bft-table/bft-table.component';
import { componentRegister } from 'app/modules/shared/services/component-register';
import { ListService } from 'app/modules/shared/services/list.service';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { CityInformationComponent } from '../../city-information/city-information-form.component';
import { MemberTypeInformationComponent } from '../member-type-information.component';
import { BaseRoutedComponent } from 'app/core/Base/base-routed/base-routed.component';
import { WrapperAddComponent } from 'app/modules/shared/permission-wrapper/wrapper-add/wrapper-add.component';

@Component({
  selector: 'app-member-type-information-list',
  standalone: true,
  imports: [BftButtonComponent, BftTableComponent,WrapperAddComponent],
  templateUrl: './member-type-information-list.component.html',
  styleUrl: './member-type-information-list.component.scss'
})
export class MemberTypeInformationListComponent extends BaseRoutedComponent{
  private modalService = inject(ModalService);
  private _listService = inject(ListService);
  title: string = componentRegister.memberType.Title;
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
      header: 'Description',
      name: 'Description',
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
  data = [];

  ngOnInit() {
    this.getData();
  }

  getData() {
    this._listService.getMemberTypeInformation().subscribe({
      next: (res: any) => {
        this.data = res;
      },
      error: (err) => {
        console.error('Error fetching member Type Information:', err);
      },
    });
  }

  onView(row) {
    this.modalService
      .openModal({
        component: MemberTypeInformationComponent,
        title: this.title,
        ID: row.ID,
      })
      .afterClose.subscribe((res: boolean) => {
        if (res) {
          this.getData();
        }
      });
  }

  addMemberType() {
    this.modalService
      .openModal({
        component: MemberTypeInformationComponent,
        title: this.title,
      })
      .afterClose.subscribe((res: boolean) => {
        if (res) {
          this.getData();
        }
      });
  }
}

