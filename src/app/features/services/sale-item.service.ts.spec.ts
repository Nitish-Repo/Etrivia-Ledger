import { TestBed } from '@angular/core/testing';

import { SaleItemServiceTs } from './sale-item.service.ts';

describe('SaleItemServiceTs', () => {
  let service: SaleItemServiceTs;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SaleItemServiceTs);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
