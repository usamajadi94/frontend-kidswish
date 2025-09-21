import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {  RouterOutlet } from '@angular/router';
import { FuseFullscreenComponent } from '@fuse/components/fullscreen';
import { FuseLoadingBarComponent } from '@fuse/components/loading-bar';


@Component({
    selector: 'modern-layout',
    templateUrl: './modern.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        FuseLoadingBarComponent,
        MatButtonModule,
        MatIconModule,
        FuseFullscreenComponent,
        RouterOutlet,
    ],
})
export class ModernLayoutComponent{

    /**
     * Constructor
     */
    constructor(){}

    ngOnInit(): void { }

}
