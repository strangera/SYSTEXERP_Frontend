import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN14110CRUComponent } from './fin14110-cru.component';

describe('FIN14110CRUComponent', () => {
  let component: FIN14110CRUComponent;
  let fixture: ComponentFixture<FIN14110CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN14110CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN14110CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
