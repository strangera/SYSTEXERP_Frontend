import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS13010CRUComponent } from './ass13010-cru.component';

describe('ASS13010CRUComponent', () => {
  let component: ASS13010CRUComponent;
  let fixture: ComponentFixture<ASS13010CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS13010CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS13010CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
