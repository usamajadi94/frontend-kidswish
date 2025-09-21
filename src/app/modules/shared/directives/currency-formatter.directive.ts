
import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';

@Directive({
  standalone:true,
  selector: '[appCurrencyFormatter]'
})
export class CurrencyFormatterDirective {
  private el: HTMLInputElement;

  constructor(private elementRef: ElementRef) {
    this.el = this.elementRef.nativeElement;
    setTimeout(() => {
      this.formatCurrency(this.el.value || '0'); // 👈 YEH LINE ADD KARO
    });
  }
  

  @HostListener('input', ['$event'])
  onInput(event: KeyboardEvent) {
    this.el.value = this.el.value.replace(/[^0-9.]/g, '');
    if (this.el.value.split('.').length > 2) {
      this.el.value = this.el.value.slice(0, -1);
    }
  }

  @HostListener('blur', ['$event.target.value'])
  onBlur(value: string) {
    this.formatCurrency(value);
  }

  @HostListener('focus', ['$event.target.value'])
  onFocus(value: string) {
    this.el.value = this.parseCurrency(value); // Revert to numeric string on focus
  }

  private formatCurrency(value: string) {
    if (value) {
      const numericValue = parseFloat(value.replace(/,/g, '')).toFixed(2);
      this.el.value = this.formatToCurrency(numericValue);
    }
  }
  // private formatCurrency(value: string) {
  //   const parsed = parseFloat(value.replace(/,/g, ''));
  //   const numericValue = isNaN(parsed) ? '0.00' : parsed.toFixed(2); 
  //   this.el.value = this.formatToCurrency(numericValue);
  // }
  

  private parseCurrency(value: string): string {
    return value.replace(/[^0-9.]/g, '');
  }

  private formatToCurrency(value: string): string {
    const [integerPart, decimalPart] = value.split('.');
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return `${formattedInteger}.${decimalPart}`;
  }
}
