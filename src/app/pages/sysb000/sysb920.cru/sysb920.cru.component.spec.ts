import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SYSB920CRUComponent } from './sysb920.cru.component';

describe('SYSB920CRUComponent', () => {
  let component: SYSB920CRUComponent;
  let fixture: ComponentFixture<SYSB920CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SYSB920CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SYSB920CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
