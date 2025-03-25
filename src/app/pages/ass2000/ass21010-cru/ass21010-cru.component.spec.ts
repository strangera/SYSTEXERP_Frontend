import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS21010CRUComponent } from './ass21010-cru.component';

describe('ASS21010CRUComponent', () => {
  let component: ASS21010CRUComponent;
  let fixture: ComponentFixture<ASS21010CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS21010CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS21010CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
