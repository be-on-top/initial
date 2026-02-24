import { TestBed } from '@angular/core/testing';

import { InnovationAwardService } from './innovation-award.service';

describe('InnovationAwardService', () => {
  let service: InnovationAwardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InnovationAwardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
