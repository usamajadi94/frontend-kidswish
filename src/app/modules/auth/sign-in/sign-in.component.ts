import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import {
    FormsModule,
    NgForm,
    ReactiveFormsModule,
    UntypedFormBuilder,
    UntypedFormGroup,
    Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertComponent, FuseAlertType } from '@fuse/components/alert';
import { ApiResponse } from 'app/core/Base/interface/IResponses';
import { AuthService } from 'app/core/auth/auth.service';
import { UserService } from 'app/core/user/user.service';
import { BftInputEmailComponent } from '../../shared/components/fields/bft-input-email/bft-input-email.component';
import { BftInputPasswordComponent } from '../../shared/components/fields/bft-input-password/bft-input-password.component';

@Component({
    selector: 'auth-sign-in',
    templateUrl: './sign-in.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
    standalone: true,
    imports: [
        RouterLink,
        FuseAlertComponent,
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatProgressSpinnerModule,
        BftInputEmailComponent,
        BftInputPasswordComponent,
    ],
})
export class AuthSignInComponent implements OnInit {
    @ViewChild('signInNgForm') signInNgForm: NgForm;
    signInForm: UntypedFormGroup;
    showAlert: boolean = false;

    alert: { type: FuseAlertType; message: string } = {
        type: 'success',
        message: '',
    };

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _authService: AuthService,
        private _formBuilder: UntypedFormBuilder,
        private _router: Router,
        private _userService: UserService
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Create the form
        this.signInForm = this._formBuilder.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', Validators.required],
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Sign in
     */
    signIn(): void {
        // Return if the form is invalid
        if (this.signInForm.invalid) {
            return;
        }
        // Disable the form
        this.signInForm.disable();

        // Hide the alert
        this.showAlert = false;

        // Sign in
        this._authService.signIn(this.signInForm.value).subscribe(
            (res: ApiResponse<any>) => {
                if (this._authService.checkPasswordChange() == true) {
                    this._router.navigateByUrl('/change-password');
                } else if (this._authService.checkMultipleEntity() == true) {
                    this._router.navigateByUrl('/switch-entity');
                }else {
                        this._userService
                            .getUser()
                            .subscribe((res: ApiResponse<any>) => {
                                this._userService.setUserProfile(res.Data);
                                if (res.Data?.value[0].IsPasswordChange) {
                                    this._router.navigateByUrl(
                                        '/change-password'
                                    );
                                } else {
                                    const redirectURL =
                                        this._activatedRoute.snapshot.queryParamMap.get(
                                            'redirectURL'
                                        ) || '/setup/company-list';
                                    this._router.navigateByUrl(redirectURL);
                                }
                            });

                        // Navigate to the redirect url
                    }
            },
            (response) => {
                // Re-enable the form
                this.signInForm.enable();

                // Reset the form
                this.signInNgForm.resetForm();

                // Set the alert
                this.alert = {
                    type: 'error',
                    message: response.error.Message,
                };

                // Show the alert
                this.showAlert = true;
            }
        );
    }
}
