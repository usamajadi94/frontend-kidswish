import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BaseComponent } from 'app/core/Base/base/base.component';
import { GenericService } from 'app/core/Base/services/generic.service';
import { ToastService } from 'app/core/toaster/toast.service';
import { BftInputTextComponent } from 'app/modules/shared/components/fields/bft-input-text/bft-input-text.component';
import { MessageModalService } from 'app/modules/shared/services/message.service';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { apiUrls } from 'app/modules/shared/services/api-url';
import { RBAC_Groups, RBAC_Module_Permissions, RBAC_Section_Permissions } from '../../models/RBAC_Groups';
import { BftSelectComponent } from 'app/modules/shared/components/fields/bft-select/bft-select.component';
import { BftCheckboxComponent } from 'app/modules/shared/components/fields/bft-checkbox/bft-checkbox.component';
import { GroupPermissionComponent } from '../group-permission/group-permission.component';
import { MatIcon } from '@angular/material/icon';
import { DrpService } from 'app/modules/shared/services/drp.service';
import { VW_Modules, VW_Sections, VW_Sections_Rights } from '../../models/VW_Permissions';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { NzTableModule } from 'ng-zorro-antd/table';
import { GroupPermission } from '../../models/group-permission';
import { EntityPermission } from '../../models/group-permission';
import { lastValueFrom } from 'rxjs';
import { Permission } from 'app/modules/shared/enums/permission';
import { componentRegister } from 'app/modules/shared/services/component-register';
@Component({
  selector: 'app-group-forms',
  standalone: true,
  imports: [
    BftInputTextComponent,
    BftCheckboxComponent,
    FormsModule,
    MatIcon,
    MatIconModule,
    MatTabsModule,
    NzTableModule
  ],
  templateUrl: './group-forms.component.html',
  styleUrl: './group-forms.component.scss'
})
export class GroupFormsComponent extends BaseComponent<RBAC_Groups, GroupFormsComponent> {

  selectedTabIndex = 0;
  private _DrpService = inject(DrpService);
  Modules: any[] = ["Setup", "DMS", "Report"];
  rights: any[] = [];
  groups: VW_Modules[] = [];

  constructor(
    private genSer: GenericService,
    private msgSer: MessageModalService,
    private modalSer: ModalService,
    private toasterSer: ToastService,
    public activatedRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    super(genSer, msgSer, modalSer, toasterSer, activatedRoute);
    this.setControllerName(apiUrls.rbacGroupsController);
    this.setFormTitle(componentRegister.group.Title);
  }

  override ngOnInit(): void {
    super.ngOnInit();
  }

  public override async BeforeInit(): Promise<void> {
    await this.getModulesAndSections();
  }

  async getModulesAndSections() {
     this.groups = await lastValueFrom(
                this._DrpService.getModulesAndSections()
            );
  }
  public override InitializeObject(): void {
    this.formData = new RBAC_Groups();
  }

  setAll(permission: VW_Sections, value: boolean): void {
    permission.Rights.forEach(right => {
      right.completed = value;
    });
  }

/*  public override BeforeUpSert(formData: RBAC_Groups): void {
    var Modules_Permission: RBAC_Module_Permissions[] = [];

    this.groups.forEach((element: VW_Modules) => {
      element.IsAccess = element.Sections.some(section =>
        section.Rights.some(right => right.completed === true)
      );

    });

    var selectedModules = this.groups.filter(a => a.IsAccess == true);
    selectedModules.forEach(element => {
      var Module_Perm: RBAC_Module_Permissions = new RBAC_Module_Permissions();
      Module_Perm.ID = 0;
      Module_Perm.GroupID = this.formData.ID;
      Module_Perm.ModuleID = element.ID;
      Module_Perm.IsAccess = element.IsAccess;
      Modules_Permission.push(Module_Perm);

    })

    var Sections_Permission: RBAC_Section_Permissions[] = [];
    selectedModules.forEach(module => {

      if (module.IsAccess == true) {
        module.Sections.forEach(section => {

          section.Rights.forEach(right => {
            if (right.completed == true) {
              var Section_Perm: RBAC_Section_Permissions = new RBAC_Section_Permissions();
              Section_Perm.ID = 0;
              Section_Perm.GroupID = this.formData.ID;
              Section_Perm.SectionID = section.ID;
              Section_Perm.RightID = right.ID;
              Sections_Permission.push(Section_Perm);
            }

          })

        })
      }

    });

    this.formData.RBAC_Module_Permissions = Modules_Permission;
    this.formData.RBAC_Section_Permissions = Sections_Permission;

  }*/

  public override BeforeUpSert(formData: RBAC_Groups): void {
  // ✅ Step 1: Mark IsAccess on each module
    this.groups.forEach((module: VW_Modules) => {
      module.IsAccess = module.Sections.some(section =>
        section.Rights.some(right => right.completed)
      );
    });

    // ✅ Step 2: Prepare Module Permissions
    const Modules_Permission: RBAC_Module_Permissions[] = this.groups
      .filter(m => m.IsAccess)
      .map(m => ({
        ID: 0,
        GroupID: this.formData.ID,
        ModuleID: m.ID,
        IsAccess: m.IsAccess,
        IsSystemGenerated: false // or set to false if appropriate
      }));

    // ✅ Step 3: Prepare Section Permissions (flatMap for cleaner expansion)
    const Sections_Permission: RBAC_Section_Permissions[] = this.groups
    .filter(m => m.IsAccess)
    .flatMap(m =>
      m.Sections.flatMap(s => {
        // 👇 ensure "View" is set if needed
        this.onRightChange(s);

        return s.Rights
          .filter(r => r.completed)
          .map(r => ({
            ID: 0,
            GroupID: this.formData.ID,
            SectionID: s.ID,
            RightID: r.ID,
            IsSystemGenerated: false
          }));
      })
    );

    // ✅ Step 4: Assign to formData
    this.formData.RBAC_Module_Permissions = Modules_Permission;
    this.formData.RBAC_Section_Permissions = Sections_Permission;
  }


  /*public override AfterGetData(): void {
    this.groups.forEach(element=>{
     
      var moduleAccess = this.formData.RBAC_Module_Permissions.filter(a => a.ModuleID == element.ID);
      
      if(moduleAccess.length > 0){
      
        element.IsAccess = true;
    
      }

      element.Sections.forEach(ele=>{
        var sectionAccess = this.formData.RBAC_Section_Permissions.filter(a=> a.SectionID == ele.ID);

        if(sectionAccess.length > 0){
         

          ele.Rights.forEach(right=>{
            var checkRight = this.formData.RBAC_Section_Permissions.filter(a=> a.RightID == right.ID && a.SectionID == ele.ID);
            if(checkRight.length > 0){
             
              right.completed = true;
            }  
          })

        }
      })

    });
  }*/

  public override AfterGetData(): void {
    this.groups.forEach(module => {
      // ✅ Mark module access
      module.IsAccess = this.formData.RBAC_Module_Permissions
        .some(mp => mp.ModuleID === module.ID);

      // ✅ Mark rights as completed
      module.Sections.forEach(section => {
        section.Rights.forEach(right => {
          right.completed = this.formData.RBAC_Section_Permissions
            .some(sp => sp.SectionID === section.ID && sp.RightID === right.ID);
        });
      });
    });
  }


  isAllChecked(permission: VW_Sections): boolean {
    return permission.Rights.every(right => right.completed);
  }
  
  isIntermediate(permission: VW_Sections): boolean {
    const rights = permission.Rights;

    const allTrue = rights.every(r => r.completed);
    const allFalse = rights.every(r => !r.completed);

    return !(allTrue || allFalse); 
  }

  onRightChange(section:VW_Sections){
    const right = section.Rights.some(r=> r.completed == true);
    if(right){
      section.Rights.forEach(r=>{
        if(r.ID == Permission.View ){
          r.completed = true;
        }
      });
    }
    
  }

}


