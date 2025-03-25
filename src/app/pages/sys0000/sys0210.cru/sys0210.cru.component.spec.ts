import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SYS0210CRUComponent } from './sys0210.cru.component';

describe('SYS0210CRUComponent', () => {
  let component: SYS0210CRUComponent;
  let fixture: ComponentFixture<SYS0210CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SYS0210CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SYS0210CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
