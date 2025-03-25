import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SYS0310CRUComponent } from './sys0310.cru.component';

describe('SYS0310CRUComponent', () => {
  let component: SYS0310CRUComponent;
  let fixture: ComponentFixture<SYS0310CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SYS0310CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SYS0310CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
