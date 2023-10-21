import { TestBed } from '@angular/core/testing';

import { ExternalsService } from './externals.service';

describe('ExternalsService', () => {
  let service: ExternalsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExternalsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
