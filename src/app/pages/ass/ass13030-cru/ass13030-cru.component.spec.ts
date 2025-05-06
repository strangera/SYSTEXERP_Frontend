import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS13030CRUComponent } from './ass13030-cru.component';

describe('ASS13030CRUComponent', () => {
  let component: ASS13030CRUComponent;
  let fixture: ComponentFixture<ASS13030CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS13030CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS13030CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
