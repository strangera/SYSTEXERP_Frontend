import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS16030CRUComponent } from './ass16030-cru.component';

describe('ASS16030CRUComponent', () => {
  let component: ASS16030CRUComponent;
  let fixture: ComponentFixture<ASS16030CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS16030CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS16030CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
