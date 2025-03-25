import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SYS0240CRUComponent } from './sys0240.cru.component';

describe('SYS0240CRUComponent', () => {
  let component: SYS0240CRUComponent;
  let fixture: ComponentFixture<SYS0240CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SYS0240CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SYS0240CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
