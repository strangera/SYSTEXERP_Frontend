import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SYSBQ00CRUComponent } from './sysbq00.cru.component';

describe('SYSBQ00CRUComponent', () => {
  let component: SYSBQ00CRUComponent;
  let fixture: ComponentFixture<SYSBQ00CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SYSBQ00CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SYSBQ00CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
