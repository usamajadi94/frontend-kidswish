
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
      if (this.el.value) this.formatCurrency(this.el.value);
    });
  }
  

  @HostListener('input', ['$event'])
  onInput(event: KeyboardEvent) {
    let value = this.el.value;
    
    // Check if value starts with minus
    const isNegative = value.startsWith('-');
    
    // Remove all non-numeric characters except decimal point
    value = value.replace(/[^0-9.]/g, '');
    
    // Add minus sign back if it was at the beginning
    if (isNegative) {
      value = '-' + value;
    }
    
    // Prevent multiple decimal points
    if (value.split('.').length > 2) {
      const parts = value.split('.');
      value = parts[0] + '.' + parts.slice(1).join('');
    }
    
    this.el.value = value;
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
      const cleanedValue = value.replace(/,/g, '');
      const numericValue = parseFloat(cleanedValue);
      if (!isNaN(numericValue)) {
        this.el.value = this.formatToCurrency(numericValue.toFixed(2));
      }
    }
  }
  // private formatCurrency(value: string) {
  //   const parsed = parseFloat(value.replace(/,/g, ''));
  //   const numericValue = isNaN(parsed) ? '0.00' : parsed.toFixed(2); 
  //   this.el.value = this.formatToCurrency(numericValue);
  // }
  

  private parseCurrency(value: string): string {
    // Preserve minus sign at the beginning and digits/periods
    const isNegative = value.startsWith('-');
    let cleaned = value.replace(/[^0-9.]/g, '');
    return isNegative ? '-' + cleaned : cleaned;
  }

  private formatToCurrency(value: string): string {
    // Handle negative values
    const isNegative = value.startsWith('-');
    const numericValue = isNegative ? value.substring(1) : value;
    
    const [integerPart, decimalPart] = numericValue.split('.');
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    
    return isNegative ? `-${formattedInteger}.${decimalPart}` : `${formattedInteger}.${decimalPart}`;
  }
}
