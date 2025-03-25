import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2D030CRUComponent } from './tls2d030-cru.component';

describe('TLS2D030CRUComponent', () => {
  let component: TLS2D030CRUComponent;
  let fixture: ComponentFixture<TLS2D030CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2D030CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2D030CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
