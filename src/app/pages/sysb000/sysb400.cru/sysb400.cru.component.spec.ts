import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SYSB400CRUComponent } from './sysb400.cru.component';

describe('SYSB400CRUComponent', () => {
  let component: SYSB400CRUComponent;
  let fixture: ComponentFixture<SYSB400CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SYSB400CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SYSB400CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
