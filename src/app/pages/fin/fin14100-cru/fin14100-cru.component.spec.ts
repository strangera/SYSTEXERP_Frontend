import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN14100CRUComponent } from './fin14100-cru.component';

describe('FIN14100CRUComponent', () => {
  let component: FIN14100CRUComponent;
  let fixture: ComponentFixture<FIN14100CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN14100CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN14100CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
