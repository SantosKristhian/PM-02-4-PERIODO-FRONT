import { TestBed } from '@angular/core/testing';

import { VendaService } from './vendas.service';

describe('VendasService', () => {
  let service: VendaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VendaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
