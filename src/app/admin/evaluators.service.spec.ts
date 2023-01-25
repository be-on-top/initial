import { TestBed } from '@angular/core/testing';

import { EvaluatorsService } from './evaluators.service';

describe('EvaluatorsService', () => {
  let service: EvaluatorsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EvaluatorsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  
});
