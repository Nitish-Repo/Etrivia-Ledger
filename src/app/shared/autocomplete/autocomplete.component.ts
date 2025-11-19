import { ChangeDetectorRef, Component, ContentChild, EventEmitter, HostListener, Input, OnChanges, OnInit, Output, SimpleChanges, TemplateRef } from '@angular/core';
import { AbstractControl, FormControl } from '@angular/forms';
import { IrsControl } from '@app/shared-services';
import { BehaviorSubject, debounceTime, distinctUntilChanged, map, Observable, of, startWith, tap } from 'rxjs';

@Component({
  selector: 'app-autocomplete',
  templateUrl: './autocomplete.component.html',
  styleUrls: ['./autocomplete.component.scss'],
})
export class AutocompleteComponent implements OnInit, OnChanges {
  @Input() form!: AbstractControl;
  @Input() label!: string;
  @Input() name!: string;
  @Input() options!: any[];
  @Input() displayField: string = 'name';
  @Input() filterField: string = 'name';
  @Input() valueField: string = 'value';
  @Output() optionSelected = new EventEmitter<any>();
  @Input() itemTemplate?: TemplateRef<any>;
  @Input() showSelectedName = false;
  @Input() requireSelection = false;


  isListVisible: boolean = false;
  selectedItem: any;
  control!: IrsControl;
  filteredOptions = new BehaviorSubject<any>([]);

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.control = this.form.get(this.name) as IrsControl;
    if (!this.control) {
      console.log(`control with name (${this.name}) is not found`);
    }

    this.control.valueChanges.pipe(
      debounceTime(300), // ✅ Prevents laggy typing
      distinctUntilChanged(), // ✅ Only update if value changes
      tap(value => {
        const matchingOption = this.options.find(
          option => option[this.valueField]?.toString().toLowerCase() === value?.toLowerCase()
        );
        this.selectedItem = matchingOption ?? null;
      }),
      map(value => this._filterOptions(value))
    ).subscribe(filtered => {
      this.filteredOptions.next(filtered);

      this.cdr.detectChanges(); // ✅ Ensures UI updates
    });


    // this.filteredOptions.next(this._filterOptions(this.control.value));
  }


  ngOnChanges(changes: SimpleChanges): void {
    if (!this.control && this.form) {
      this.control = this.form.get(this.name) as IrsControl;
    }

    if (changes && changes['options']?.currentValue) {
      this.options = changes['options'].currentValue;

      if (this.control) {
        const matchingOption = this.options.find(
          option => option[this.valueField]?.toString().toLowerCase() === this.control.value?.toLowerCase()
        );

        if (matchingOption) {
          this.selectedItem = matchingOption;
        }
      }
    }
  }



  filterOptions(event: Event): void {
    const input = event.target as HTMLInputElement;
    const filterValue = input.value.toLowerCase();
    this.filteredOptions.next(this._filterOptions(filterValue));
  }

  private _filterOptions(value: string): any[] {
    if (value) {
      const filterValue = value.toLowerCase();
      return this.options.filter(option =>
        option[this.filterField]?.toString().toLowerCase().includes(filterValue)
      );
    } else {
      return this.options.slice();
    }
  }

  openDropdown() {
    this.isListVisible = true;
  }

  handleBlur() {
    this.validateSelection(); // Moved validation to a reusable method
    this.cdr.detectChanges();
    setTimeout(() => {
      this.isListVisible = false;
    }, 200);
  }

  @HostListener('keydown.enter', ['$event'])
  handleEnter(event: Event) {
    const keyboardEvent = event as KeyboardEvent;
    this.validateSelection();
    if (!this.selectedItem) {
      // keyboardEvent.preventDefault(); 
    }
  }

  // 🔥 Centralized validation logic
  private validateSelection() {
    const control = this.form.get(this.name);
    if (this.requireSelection) {
      const enteredValue = control?.value;
      const matchingOption = this.options.find(
        (option) =>
          option[this.valueField]?.toString().toLowerCase() === enteredValue?.toLowerCase()
      );

      if (!matchingOption) {
        control?.setValue('');
        // control?.setErrors({ invalidSelection: true });
      } else {
        control?.setErrors(null);
      }
    }
  }



  selectOption(item: any) {
    this.control.setValue(item[this.valueField]);
    this.selectedItem = item;
    this.optionSelected.emit(item);
    this.isListVisible = false;
  }
}
