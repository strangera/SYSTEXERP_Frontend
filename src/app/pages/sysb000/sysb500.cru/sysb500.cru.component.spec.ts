import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SYSB500CRUComponent } from './sysb500.cru.component';

describe('SYSB500CRUComponent', () => {
  let component: SYSB500CRUComponent;
  let fixture: ComponentFixture<SYSB500CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SYSB500CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SYSB500CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
