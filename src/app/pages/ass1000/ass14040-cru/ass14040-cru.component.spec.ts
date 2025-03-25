import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS14040CRUComponent } from './ass14040-cru.component';

describe('ASS14040CRUComponent', () => {
  let component: ASS14040CRUComponent;
  let fixture: ComponentFixture<ASS14040CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS14040CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS14040CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
