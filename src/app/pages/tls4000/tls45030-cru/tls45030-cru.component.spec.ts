import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS45030CRUComponent } from './tls45030-cru.component';

describe('TLS45030CRUComponent', () => {
  let component: TLS45030CRUComponent;
  let fixture: ComponentFixture<TLS45030CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS45030CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS45030CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
