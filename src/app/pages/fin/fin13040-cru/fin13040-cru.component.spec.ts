import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN14030CRUComponent } from './fin13040-cru.component';

describe('FIN14030CRUComponent', () => {
  let component: FIN14030CRUComponent;
  let fixture: ComponentFixture<FIN14030CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN14030CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN14030CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
