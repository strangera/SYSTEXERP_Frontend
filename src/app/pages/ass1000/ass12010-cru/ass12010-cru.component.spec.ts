import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS12010CRUComponent } from './ass12010-cru.component';

describe('ASS12010CRUComponent', () => {
  let component: ASS12010CRUComponent;
  let fixture: ComponentFixture<ASS12010CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS12010CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS12010CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
