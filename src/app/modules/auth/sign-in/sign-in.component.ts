import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import {
    FormsModule,
    NgForm,
    ReactiveFormsModule,
    UntypedFormBuilder,
    UntypedFormGroup,
    Validators,
} from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertType } from '@fuse/components/alert';
import { ApiResponse } from 'app/core/Base/interface/IResponses';
import { AuthService } from 'app/core/auth/auth.service';
import { UserService } from 'app/core/user/user.service';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'auth-sign-in',
    templateUrl: './sign-in.component.html',
    styleUrl: './sign-in.component.scss',
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
    standalone: true,
    imports: [
        CommonModule,
        RouterLink,
        FormsModule,
        ReactiveFormsModule,
        MatIconModule,
        MatProgressSpinnerModule,
    ],
})
export class AuthSignInComponent implements OnInit {
    @ViewChild('signInNgForm') signInNgForm: NgForm;
    signInForm: UntypedFormGroup;
    showAlert: boolean = false;
    showPassword: boolean = false;

    alert: { type: FuseAlertType; message: string } = {
        type: 'error',
        message: '',
    };

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _authService: AuthService,
        private _formBuilder: UntypedFormBuilder,
        private _router: Router,
        private _userService: UserService
    ) {}

    ngOnInit(): void {
        this.signInForm = this._formBuilder.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', Validators.required],
        });
    }

    signIn(): void {
        if (this.signInForm.invalid) {
            this.signInForm.markAllAsTouched();
            return;
        }
        this.signInForm.disable();
        this.showAlert = false;

        this._authService.signIn(this.signInForm.value).subscribe(
            (res: ApiResponse<any>) => {
                if (this._authService.checkPasswordChange() == true) {
                    this._router.navigateByUrl('/change-password');
                } else if (this._authService.checkMultipleEntity() == true) {
                    this._router.navigateByUrl('/switch-entity');
                } else {
                    this._userService.getUser().subscribe((res: ApiResponse<any>) => {
                        this._userService.setUserProfile(res.Data);
                        if (res.Data?.value[0].IsPasswordChange) {
                            this._router.navigateByUrl('/change-password');
                        } else {
                            const redirectURL =
                                this._activatedRoute.snapshot.queryParamMap.get('redirectURL') ||
                                '/dashboard';
                            this._router.navigateByUrl(redirectURL);
                        }
                    });
                }
            },
            (response) => {
                this.signInForm.enable();
                this.signInNgForm.resetForm();
                this.alert = {
                    type: 'error',
                    message: response.error?.Message || 'Invalid username or password.',
                };
                this.showAlert = true;
            }
        );
    }
}
