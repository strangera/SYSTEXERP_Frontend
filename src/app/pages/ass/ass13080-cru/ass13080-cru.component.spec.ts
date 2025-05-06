import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS13080CRUComponent } from './ass13080-cru.component';

describe('ASS13080CRUComponent', () => {
  let component: ASS13080CRUComponent;
  let fixture: ComponentFixture<ASS13080CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS13080CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS13080CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
