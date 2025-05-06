import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS12020CRUComponent } from './ass12020-cru.component';

describe('ASS12020CRUComponent', () => {
  let component: ASS12020CRUComponent;
  let fixture: ComponentFixture<ASS12020CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS12020CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS12020CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
