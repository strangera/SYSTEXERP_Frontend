import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS12050CRUComponent } from './ass12050-cru.component';

describe('ASS12050CRUComponent', () => {
  let component: ASS12050CRUComponent;
  let fixture: ComponentFixture<ASS12050CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS12050CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS12050CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
