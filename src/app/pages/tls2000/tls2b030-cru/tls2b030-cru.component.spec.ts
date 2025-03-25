import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2B030CRUComponent } from './tls2b030-cru.component';

describe('TLS2B030CRUComponent', () => {
  let component: TLS2B030CRUComponent;
  let fixture: ComponentFixture<TLS2B030CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2B030CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2B030CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
