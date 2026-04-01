import { inject, Injectable } from '@angular/core';
import { componentRegister } from 'app/modules/shared/services/component-register';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { DepartmentFormComponent } from '../components/department/department-form.component';

@Injectable({
    providedIn: 'root',
})
export class SetComponentRegisterService {
    private _ModalService = inject(ModalService);

    addDepartment() {
        const modalRef = this._ModalService.openModal({
            component: DepartmentFormComponent,
            title: componentRegister.department.Title,
        });

        return modalRef.afterClose;
    }
}
