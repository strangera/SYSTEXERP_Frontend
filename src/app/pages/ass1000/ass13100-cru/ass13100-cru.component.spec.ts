import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS13100CRUComponent } from './ass13100-cru.component';

describe('ASS13100CRUComponent', () => {
  let component: ASS13100CRUComponent;
  let fixture: ComponentFixture<ASS13100CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS13100CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS13100CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
