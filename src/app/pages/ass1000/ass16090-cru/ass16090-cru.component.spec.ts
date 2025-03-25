import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS16090CRUComponent } from './ass16090-cru.component';

describe('ASS16090CRUComponent', () => {
  let component: ASS16090CRUComponent;
  let fixture: ComponentFixture<ASS16090CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS16090CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS16090CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
