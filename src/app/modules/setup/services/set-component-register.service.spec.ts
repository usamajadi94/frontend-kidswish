import { TestBed } from '@angular/core/testing';

import { SetComponentRegisterService } from './set-component-register.service';

describe('SetComponentRegisterService', () => {
  let service: SetComponentRegisterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SetComponentRegisterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
