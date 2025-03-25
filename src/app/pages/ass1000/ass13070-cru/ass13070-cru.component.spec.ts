import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS13070CRUComponent } from './ass13070-cru.component';

describe('ASS13070CRUComponent', () => {
  let component: ASS13070CRUComponent;
  let fixture: ComponentFixture<ASS13070CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS13070CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS13070CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
