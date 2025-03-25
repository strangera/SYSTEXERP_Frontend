import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS11030CRUComponent } from './ass11030-cru.component';

describe('ASS11030CRUComponent', () => {
  let component: ASS11030CRUComponent;
  let fixture: ComponentFixture<ASS11030CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS11030CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS11030CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
