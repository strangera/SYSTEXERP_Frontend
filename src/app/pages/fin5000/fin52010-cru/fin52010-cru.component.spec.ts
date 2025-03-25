import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN52010CRUComponent } from './fin52010-cru.component';

describe('FIN52010CRUComponent', () => {
  let component: FIN52010CRUComponent;
  let fixture: ComponentFixture<FIN52010CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN52010CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN52010CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
