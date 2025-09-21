import {
    ChangeDetectionStrategy,
    Component,
    inject,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';

import { BftInputEmailComponent } from 'app/modules/shared/components/fields/bft-input-email/bft-input-email.component';
import { BftInputPhoneComponent } from 'app/modules/shared/components/fields/bft-input-phone/bft-input-phone.component';
import { BftInputTextComponent } from 'app/modules/shared/components/fields/bft-input-text/bft-input-text.component';
import { BftTextareaComponent } from 'app/modules/shared/components/fields/bft-textarea/bft-textarea.component';

import { AuthService } from 'app/core/auth/auth.service';
import { UserService } from 'app/core/user/user.service';
import { MessageModalService } from 'app/modules/shared/services/message.service';
import { AccountInformation } from '../../models/account-info';

@Component({
    selector: 'app-account',
    standalone: true,
    templateUrl: './account.component.html',
    styleUrls: ['./account.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        FormsModule,
        MatFormFieldModule,
        MatIconModule,
        MatButtonModule,
        BftInputTextComponent,
        BftTextareaComponent,
        BftInputPhoneComponent,
        BftInputEmailComponent,
    ],
})
export class AccountComponent implements OnInit {
    private _userService = inject(UserService);
    private _messageModalService = inject(MessageModalService);
    private _authService = inject(AuthService);

    formData = new AccountInformation();

    errors: {
        firstname?: string;
        lastname?: string;
        email?: string;
    } = {};

    ngOnInit(): void {
        this._userService.user$.subscribe((user) => {
            if (user) {
                this.formData = {
                    FirstName: user.FirstName || '',
                    LastName: user.LastName || '',
                    UserName: user.UserName || '',
                    Address: user.Address || '',
                    Email: user.Email || '',
                    PhoneNo: user.PhoneNo || '',
                };
            }
        });
    }

    updateMyProfile(): void {
        this._authService.updateMyProfile(this.formData).subscribe({
            next: (res: any) => {
                this._messageModalService.success(
                    'Profile updated successfully!'
                );
            },
            error: (err) => {
                this._messageModalService.error(
                    err.error?.Errors || 'Something went wrong.'
                );
            },
        });
    }
}
