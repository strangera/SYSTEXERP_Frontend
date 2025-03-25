import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SYSB200CRUComponent } from './sysb200.cru.component';

describe('SYSB200CRUComponent', () => {
  let component: SYSB200CRUComponent;
  let fixture: ComponentFixture<SYSB200CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SYSB200CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SYSB200CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
