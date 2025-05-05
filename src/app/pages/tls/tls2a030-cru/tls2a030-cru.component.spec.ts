import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2A030CRUComponent } from './tls2a030-cru.component';

describe('TLS2A030CRUComponent', () => {
  let component: TLS2A030CRUComponent;
  let fixture: ComponentFixture<TLS2A030CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2A030CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2A030CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
