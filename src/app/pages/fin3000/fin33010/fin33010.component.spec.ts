import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN33010Component } from './fin33010.component';

describe('FIN33010Component', () => {
  let component: FIN33010Component;
  let fixture: ComponentFixture<FIN33010Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN33010Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN33010Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
