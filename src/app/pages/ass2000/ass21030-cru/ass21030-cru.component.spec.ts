import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS21030CRUComponent } from './ass21030-cru.component';

describe('ASS21030CRUComponent', () => {
  let component: ASS21030CRUComponent;
  let fixture: ComponentFixture<ASS21030CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS21030CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS21030CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
