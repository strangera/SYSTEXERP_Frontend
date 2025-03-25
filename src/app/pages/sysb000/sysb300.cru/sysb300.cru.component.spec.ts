import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SYSB300CRUComponent } from './sysb300.cru.component';

describe('SYSB300CRUComponent', () => {
  let component: SYSB300CRUComponent;
  let fixture: ComponentFixture<SYSB300CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SYSB300CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SYSB300CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
