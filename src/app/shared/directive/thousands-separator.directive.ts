import {
  Directive,
  ElementRef,
  forwardRef,
  HostListener
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR
} from '@angular/forms';

@Directive({
  selector: '[thousandsSeparator]',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ThousandsSeparatorDirective),
      multi: true
    }
  ]
})
export class ThousandsSeparatorDirective implements ControlValueAccessor {
  private onChange: (_: any) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private el: ElementRef<HTMLInputElement>) {}

  @HostListener('input', ['$event.target.value'])
  onInput(value: string): void {
    const rawValue = value.replace(/\s/g, '').replace(/\D/g, '');
    const formatted = this.formatNumber(rawValue);
    this.el.nativeElement.value = formatted;
    this.onChange(rawValue); // Envoie la valeur brute au modèle
  }

  @HostListener('blur')
  onBlur(): void {
    this.onTouched();
  }

  writeValue(value: any): void {
    const rawValue = value ? value.toString().replace(/\s/g, '').replace(/\D/g, '') : '';
    this.el.nativeElement.value = this.formatNumber(rawValue);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.el.nativeElement.disabled = isDisabled;
  }

  private formatNumber(value: string): string {
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }
}
