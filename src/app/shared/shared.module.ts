import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicElementModule } from './ionic-modules/ionic-element.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputComponent } from './input/input.component';
import { QuestionModalComponent } from './question-modal/question-modal.component';
import { SvgComponent } from './svg/svg.component';
import { AutocompleteComponent } from './autocomplete/autocomplete.component';
import { QuestionsFilterComponent } from './questions-filter/questions-filter.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { DateFormatPipe } from '@app/protected/services/luxon-Date-format';

@NgModule({
  declarations: [InputComponent, QuestionModalComponent, SvgComponent, AutocompleteComponent, QuestionsFilterComponent, DateFormatPipe],
  imports: [CommonModule, IonicElementModule, ReactiveFormsModule, FormsModule, ScrollingModule],
  exports: [InputComponent, QuestionModalComponent, ReactiveFormsModule, SvgComponent, AutocompleteComponent, QuestionsFilterComponent, DateFormatPipe],
})
export class SharedModule {
  static forRoot(): ModuleWithProviders<SharedModule> {
    return {
      ngModule: SharedModule,
      providers: [],
    };
  }
}
