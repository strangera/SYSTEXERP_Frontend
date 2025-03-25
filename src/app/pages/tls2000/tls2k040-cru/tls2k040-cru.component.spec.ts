import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2K040CRUComponent } from './tls2k040-cru.component';

describe('TLS2K040CRUComponent', () => {
  let component: TLS2K040CRUComponent;
  let fixture: ComponentFixture<TLS2K040CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2K040CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2K040CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
