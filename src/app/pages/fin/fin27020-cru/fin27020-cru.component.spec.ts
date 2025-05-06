import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN27020CRUComponent } from './fin27020-cru.component';

describe('FIN27020CRUComponent', () => {
  let component: FIN27020CRUComponent;
  let fixture: ComponentFixture<FIN27020CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN27020CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN27020CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
