import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN24030CRUComponent } from './fin24030-cru.component';

describe('FIN24030CRUComponent', () => {
  let component: FIN24030CRUComponent;
  let fixture: ComponentFixture<FIN24030CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN24030CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN24030CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
