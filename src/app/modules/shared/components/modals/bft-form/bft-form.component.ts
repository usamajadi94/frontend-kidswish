import { AfterViewInit, Component, inject,  Type, ViewChild, ViewContainerRef } from '@angular/core';
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal';
import { BftButtonComponent } from '../../buttons/bft-button/bft-button.component';
import { WrapperAddComponent } from 'app/modules/shared/permission-wrapper/wrapper-add/wrapper-add.component';
import { WrapperDeleteComponent } from 'app/modules/shared/permission-wrapper/wrapper-delete/wrapper-delete.component';
import { WrapperUpdateComponent } from 'app/modules/shared/permission-wrapper/wrapper-update/wrapper-update.component';

@Component({
  selector: 'app-bft-form',
  standalone: true,
  imports: [BftButtonComponent,WrapperAddComponent,WrapperDeleteComponent,WrapperUpdateComponent],
  templateUrl: './bft-form.component.html',
  styleUrl: './bft-form.component.scss'
})
export class BftFormComponent implements AfterViewInit {
  readonly nzModalData: IModalData = inject(NZ_MODAL_DATA);
  @ViewChild('dynamicContent', { read: ViewContainerRef }) dynamicContent!: ViewContainerRef;
  ExistingComponent: any = null;
  primaryKey: number  = 0; 
  constructor(){  }
  ngAfterViewInit(): void {
    
    this.loadComponent();
    setTimeout(() => {
      
      // if(this.ExistingComponent.instance.formData.ID != null ){
      //   this.primaryKey = this.ExistingComponent.instance.formData.ID;
      //   console.log('primary' , this.primaryKey)
      // }
    }, 1000);
  }

  async loadComponent(){
    this.dynamicContent.clear();

    const componentRef = this.dynamicContent.createComponent(this.nzModalData.component);
    this.ExistingComponent = componentRef;
 
  }

  save() {
    const dynamicComponentInstance = this.ExistingComponent.instance;
    if (dynamicComponentInstance && typeof dynamicComponentInstance.InsertRecord === 'function') {
      dynamicComponentInstance.InsertRecord();
    }
  }

  close() {
    const dynamicComponentInstance = this.ExistingComponent.instance;
    if (dynamicComponentInstance && typeof dynamicComponentInstance.closeModal === 'function') {
      dynamicComponentInstance.closeModal();
    }
  }

  delete(){
    const dynamicComponentInstance = this.ExistingComponent.instance;
    if (dynamicComponentInstance && typeof dynamicComponentInstance.Delete === 'function') {
      dynamicComponentInstance.Delete();
    }
  }

  edit(){
    const dynamicComponentInstance = this.ExistingComponent.instance;
    if (dynamicComponentInstance && typeof dynamicComponentInstance.EditRecord === 'function') {
      dynamicComponentInstance.EditRecord();
    }
  }

  get sCode(): string | undefined {
  const formData = this.ExistingComponent?.instance?.formData;
  return Array.isArray(formData) ? formData[0]?.SCode : formData?.SCode;
}


}

export interface IModalData{
  ID:number;
  component:Type<any>
}