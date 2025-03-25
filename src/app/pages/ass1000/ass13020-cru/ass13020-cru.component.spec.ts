import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS13020CRUComponent } from './ass13020-cru.component';

describe('ASS13020CRUComponent', () => {
  let component: ASS13020CRUComponent;
  let fixture: ComponentFixture<ASS13020CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS13020CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS13020CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
