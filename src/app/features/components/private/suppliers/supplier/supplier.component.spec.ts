import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SupplierComponent } from './supplier.component';

describe('SupplierComponent', () => {
  let component: SupplierComponent;
  let fixture: ComponentFixture<SupplierComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [SupplierComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SupplierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
