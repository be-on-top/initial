import { TestBed } from '@angular/core/testing';

import { SocialsService } from './socials.service';

describe('SocialsService', () => {
  let service: SocialsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SocialsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
