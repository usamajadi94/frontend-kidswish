import {
    ChangeDetectionStrategy,
    Component,
    inject,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { fuseAnimations } from '@fuse/animations';
import { AuthService } from 'app/core/auth/auth.service';
import { BftInputPasswordComponent } from 'app/modules/shared/components/fields/bft-input-password/bft-input-password.component';
import { MessageModalService } from 'app/modules/shared/services/message.service';
import { ChangePassword } from '../../models/change-password';

@Component({
    selector: 'app-security',
    standalone: true,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        FormsModule,
        ReactiveFormsModule,
        BftInputPasswordComponent,
        MatButtonModule,
    ],
    animations: fuseAnimations,
    templateUrl: './security.component.html',
    styleUrl: './security.component.scss',
})
export class SecurityComponent{
    private _authService = inject(AuthService);
    private _messageModalService = inject(MessageModalService);
    formData = new ChangePassword();
    errors: { currentPassword?: string; newPassword?: string } = {};
    
    changePassword(): void {
        if (!this.validateForm()) {
            return;
        }

        const payload = {
            CurrentPassword: this.formData.CurrentPassword.trim(),
            NewPassword: this.formData.NewPassword.trim(),
        };

        this._authService.changePassword(payload).subscribe({
            next: () => {
                this.formData = new ChangePassword();
                this._messageModalService.success(
                    'Password updated successfully!'
                );
            },
            error: (err) => {
                debugger;
                this._messageModalService.error(
                    err.error?.Message || 'Something went wrong.'
                );
            },
        });
    }

    validateForm(): boolean {
        this.errors = {};

        const current = this.formData.CurrentPassword?.trim();
        const next = this.formData.NewPassword?.trim();

        // Validate current password
        if (!current) {
            this.errors.currentPassword = 'Current password is required.';
        }

        // Validate new password
        if (!next) {
            this.errors.newPassword = 'New password is required.';
        } else if (next.length < 8) {
            this.errors.newPassword = 'Password must be at least 8 characters.';
        } else if (!this.hasStrongPassword(next)) {
            this.errors.newPassword =
                'Password must include letters, numbers, and special characters.';
        }

        return Object.keys(this.errors).length === 0;
    }

    hasStrongPassword(password: string): boolean {
        // At least one letter, one number, and one special character
        return (
            /[A-Za-z]/.test(password) &&
            /[0-9]/.test(password) &&
            /[^A-Za-z0-9]/.test(password)
        );
    }
}
