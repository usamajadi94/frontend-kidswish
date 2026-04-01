import { I18nPluralPipe } from '@angular/common';
import { Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import {
    FormsModule,
    ReactiveFormsModule,
    UntypedFormBuilder,
    UntypedFormGroup,
    Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertComponent, FuseAlertType } from '@fuse/components/alert';
import { FuseValidators } from '@fuse/validators';
import { AuthService } from 'app/core/auth/auth.service';
import { BftInputPasswordComponent } from 'app/modules/shared/components/fields/bft-input-password/bft-input-password.component';
import { finalize, takeWhile, tap, timer } from 'rxjs';

@Component({
    selector: 'app-change-password',
    standalone: true,
    imports: [
        FuseAlertComponent,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        BftInputPasswordComponent,
        I18nPluralPipe,
    ],
    templateUrl: './change-password.component.html',
    styleUrls: ['./change-password.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
})
export class ChangePasswordComponent implements OnInit {
    private _authService = inject(AuthService);
    private _router = inject(Router);
    alert: { type: FuseAlertType; message: string } = {
        type: 'success',
        message: '',
    };
    changePasswordForm!: UntypedFormGroup;
    showAlert: boolean = false;
    countdown: number = 5;
    countdownMapping: any = {
        '=1': '# second',
        other: '# seconds',
    };

    constructor(private _formBuilder: UntypedFormBuilder) {}

    ngOnInit(): void {
        this.changePasswordForm = this._formBuilder.group(
            {
                currentPassword: ['', Validators.required],
                password: ['', [Validators.required, Validators.minLength(8)]],
                passwordConfirm: ['', Validators.required],
            },
            {
                validators: FuseValidators.mustMatch(
                    'password',
                    'passwordConfirm'
                ),
            }
        );
    }

    /**
     * Change password
     */
    changePassword(): void {
        if (this.changePasswordForm.invalid) {
            this.alert = {
                type: 'error',
                message: 'Please fill all fields correctly.',
            };
            this.showAlert = true;
            return;
        }

        const payload = {
            currentPassword:
                this.changePasswordForm.value.currentPassword.trim(),
            newPassword: this.changePasswordForm.value.password.trim(),
            IsPasswordChange: false,
        };

        // API call yahan karein (example commented)
        this._authService.changePassword(payload).subscribe({
            next: (res) => {
                this.alert = {
                    type: 'success',
                    message: res.message || 'Password changed successfully!',
                };
                this.showAlert = true;
                this.changePasswordForm.reset();

                // Sign out the user
                this._authService.signOut();

                // Start countdown and redirect after it's done
                timer(1000, 1000)
                    .pipe(
                        takeWhile(() => this.countdown > 0),
                        tap(() => this.countdown--),
                        finalize(() => {
                            this._router.navigateByUrl('/sign-in');
                        })
                    )
                    .subscribe();
            },
            error: (err) => {
                this.alert = {
                    type: 'error',
                    message: err.error?.Message || 'Something went wrong!',
                };
                this.showAlert = true;
            },
        });
    }
}
