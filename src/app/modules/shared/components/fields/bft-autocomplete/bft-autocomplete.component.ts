import {
    Component,
    EventEmitter,
    Input,
    Output,
    ViewChild,
    forwardRef,
} from '@angular/core';
import {
    ControlValueAccessor,
    FormsModule,
    NG_VALUE_ACCESSOR,
    ReactiveFormsModule,
} from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import {
    NzAutocompleteComponent,
    NzAutocompleteModule,
} from 'ng-zorro-antd/auto-complete';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { BftSkeletonComponent } from '../../skeleton/bft-skeleton/bft-skeleton.component';

@Component({
    selector: 'bft-autocomplete',
    standalone: true,
    imports: [
        FormsModule,
        ReactiveFormsModule,
        NzInputModule,
        NzFormModule,
        MatIconModule,
        NzAutocompleteModule,
        BftSkeletonComponent,
    ],
    templateUrl: './bft-autocomplete.component.html',
    styleUrls: ['./bft-autocomplete.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => BftAutocompleteComponent),
            multi: true,
        },
    ],
})
export class BftAutocompleteComponent implements ControlValueAccessor {
    @Input() placeholder: string = 'Search...';
    @Input() label: string = '';
    @Input() prefixIcon: string | null = null;
    @Input() disabled: boolean = false;
    @Input() required: boolean = false;
    @Input() isLoading: boolean = false;
    @Input() skeleton: boolean = false;
    @Input() options: any[] = [];
    @Input() displayField: string = ''; // which field to display in autocomplete
    @Output() optionSelected = new EventEmitter<any>();
    @Output() onInput = new EventEmitter<any>();

    @ViewChild('auto') autoCompleteComp!: NzAutocompleteComponent;
    value: string = '';

    onChange = (_: any) => {};
    onTouched = () => {};

    writeValue(value: any): void {
        this.value = value;
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

    onInputChange(value: string): void {
        this.value = value;
        this.onChange(value);
    }

    onOptionSelect(selected: any): void {
        this.optionSelected.emit(selected);
    }

    Input(value: string) {
        this.onInput.emit(value);
    }

    displayWithFn = (item: any): string => {
        return item ? item[this.displayField] : '';
    };
}
