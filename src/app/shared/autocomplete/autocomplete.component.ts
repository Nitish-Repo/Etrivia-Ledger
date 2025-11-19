import { ChangeDetectorRef, Component, ContentChild, EventEmitter, HostListener, Input, OnChanges, OnInit, Output, SimpleChanges, TemplateRef, signal, computed } from '@angular/core';
import { CommonModule, NgTemplateOutlet } from '@angular/common';
import { AbstractControl, FormControl, ReactiveFormsModule } from '@angular/forms';
import { IrsControl } from '@app/shared-services';
import { debounceTime, distinctUntilChanged, map, Observable, of, startWith, tap } from 'rxjs';
import { IONIC_COMMON_IMPORTS } from '@app/shared/ionic-imports';
import { ScrollingModule } from '@angular/cdk/scrolling';

@Component({
  selector: 'app-autocomplete',
  templateUrl: './autocomplete.component.html',
  styleUrls: ['./autocomplete.component.scss'],
  standalone: true,
  imports: [CommonModule, NgTemplateOutlet, ReactiveFormsModule, ...IONIC_COMMON_IMPORTS, ScrollingModule]
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
  
  // ✅ Use signals instead of BehaviorSubject for better performance
  filteredOptions = signal<any[]>([]);

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
      this.filteredOptions.set(filtered); // ✅ Signal update
      this.cdr.markForCheck(); // ✅ Zoneless change detection
    });
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
    this.filteredOptions.set(this._filterOptions(filterValue)); // ✅ Signal update
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
    this.cdr.markForCheck();
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
