import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { FilterService } from '@app/protected/services/filter.service';

@Component({
  selector: 'app-questions-filter',
  templateUrl: './questions-filter.component.html',
  styleUrls: ['./questions-filter.component.scss'],
})
export class QuestionsFilterComponent implements OnInit {
  @Output() roleChange = new EventEmitter<string>();
  @Output() categoryChange = new EventEmitter<string>();

  @Input() selectedRole: string = '';
  @Input() selectedCategory: string = '';

  crewRoles: { key: string; label: string }[] = [];
  categories: { key: string; label: string }[] = [];

  constructor(private filterService: FilterService,
  ) { }

  ngOnInit() {
    this.initializeFilters();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.initializeFilters();
  }

  private initializeFilters() {
    this.crewRoles = this.filterService.getCrewRoles();
    this.categories = this.filterService.getCategories();
  }

  onRoleChange() {
    this.roleChange.emit(this.selectedRole);
  }

  onTestingChange() {
    this.categoryChange.emit(this.selectedCategory);
  }
}
