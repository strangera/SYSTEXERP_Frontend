import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS13090CRUComponent } from './ass13090-cru.component';

describe('ASS13090CRUComponent', () => {
  let component: ASS13090CRUComponent;
  let fixture: ComponentFixture<ASS13090CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS13090CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS13090CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
