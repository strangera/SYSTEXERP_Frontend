import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SYS0620CRUComponent } from './sys0620.cru.component';

describe('SYS0620CRUComponent', () => {
  let component: SYS0620CRUComponent;
  let fixture: ComponentFixture<SYS0620CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SYS0620CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SYS0620CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
