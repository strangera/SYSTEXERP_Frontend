import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS21050CRUComponent } from './ass21050-cru.component';

describe('ASS21050CRUComponent', () => {
  let component: ASS21050CRUComponent;
  let fixture: ComponentFixture<ASS21050CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS21050CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS21050CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
