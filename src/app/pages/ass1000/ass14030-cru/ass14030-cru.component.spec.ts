import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS14030CRUComponent } from './ass14030-cru.component';

describe('ASS14030CRUComponent', () => {
  let component: ASS14030CRUComponent;
  let fixture: ComponentFixture<ASS14030CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS14030CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS14030CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
