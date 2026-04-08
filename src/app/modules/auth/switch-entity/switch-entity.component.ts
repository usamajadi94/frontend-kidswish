import { Component, OnInit } from '@angular/core';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { EntityService } from 'app/core/auth/entity.service';
import { BftButtonComponent } from 'app/modules/shared/components/buttons/bft-button/bft-button.component';
import { NzTableModule } from 'ng-zorro-antd/table';
import { BftInputTextComponent } from '../../shared/components/fields/bft-input-text/bft-input-text.component';
import { UserService } from 'app/core/user/user.service';
import { LocalStorageService } from 'app/core/auth/localStorage.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-switch-entity',
    standalone: true,
    imports: [BftInputTextComponent, NzTableModule, BftButtonComponent],
    templateUrl: './switch-entity.component.html',
    styleUrl: './switch-entity.component.scss',
})
export class SwitchEntityComponent implements OnInit {
    public data = [];
    constructor(
        private _entity: EntityService,
        private _fuseConfirmationService: FuseConfirmationService,
        private __userService: UserService,
        private _localStorageService: LocalStorageService,
        private _router: Router
    ) {}

    async ngOnInit(): Promise<void> {
        this.getEntity();
    }


    getEntity() {
        this._entity.getEntites().subscribe((res) => {
            this.data = res.value;
        });
    }

    onEntitySelect(item: any) {
        this._fuseConfirmationService
            .open({
                title: 'Switch Entity',
                message: 'Are you sure you want to switch entity?',
                icon: {
                    show: true,
                    name: 'heroicons_outline:exclamation-triangle',
                    color: 'warn',
                },
                actions: {
                    confirm: {
                        show: true,
                        label: 'Switch',
                        color: 'warn',
                    },
                    cancel: {
                        show: true,
                        label: 'Cancel',
                    },
                },
                dismissible: true,    
            })
            .afterClosed()    
            .subscribe((res) => {
                if (res) {
                    this._localStorageService.eid = item.EID;
                    this.__userService.clearUserCache();
                    this.__userService.getUser().subscribe((res) => {
                        this.__userService.setUserProfile(res.Data);
                        this._router.navigate(['/dashboard']);
                    })
                }
            })
    }
}
