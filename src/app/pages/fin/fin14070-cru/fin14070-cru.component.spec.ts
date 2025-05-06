import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN14070CRUComponent } from './fin14070-cru.component';

describe('FIN14070CRUComponent', () => {
  let component: FIN14070CRUComponent;
  let fixture: ComponentFixture<FIN14070CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN14070CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN14070CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
