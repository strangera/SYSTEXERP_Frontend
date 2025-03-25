import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS21020CRUComponent } from './ass21020-cru.component';

describe('ASS21020CRUComponent', () => {
  let component: ASS21020CRUComponent;
  let fixture: ComponentFixture<ASS21020CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS21020CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS21020CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
