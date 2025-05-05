import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS16050CRUComponent } from './ass16050-cru.component';

describe('ASS16050CRUComponent', () => {
  let component: ASS16050CRUComponent;
  let fixture: ComponentFixture<ASS16050CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS16050CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS16050CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
