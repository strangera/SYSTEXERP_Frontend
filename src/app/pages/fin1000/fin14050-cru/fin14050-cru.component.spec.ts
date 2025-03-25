import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN14050CRUComponent } from './fin14050-cru.component';

describe('FIN14050CRUComponent', () => {
  let component: FIN14050CRUComponent;
  let fixture: ComponentFixture<FIN14050CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN14050CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN14050CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
