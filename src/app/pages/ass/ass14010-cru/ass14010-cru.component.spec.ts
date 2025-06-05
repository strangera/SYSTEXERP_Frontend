import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS14010CRUComponent } from './ass14010-cru.component';

describe('ASS14010CRUComponent', () => {
  let component: ASS14010CRUComponent;
  let fixture: ComponentFixture<ASS14010CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS14010CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS14010CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
