import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN27010CRUComponent } from './fin27010-cru.component';

describe('FIN27010CRUComponent', () => {
  let component: FIN27010CRUComponent;
  let fixture: ComponentFixture<FIN27010CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN27010CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN27010CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
