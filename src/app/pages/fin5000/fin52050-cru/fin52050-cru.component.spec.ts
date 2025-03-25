import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN52050CRUComponent } from './fin52050-cru.component';

describe('FIN52050CRUComponent', () => {
  let component: FIN52050CRUComponent;
  let fixture: ComponentFixture<FIN52050CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN52050CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN52050CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
