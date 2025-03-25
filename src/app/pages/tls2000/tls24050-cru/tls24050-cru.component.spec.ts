import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS24050CRUComponent } from './tls24050-cru.component';

describe('TLS24050CRUComponent', () => {
  let component: TLS24050CRUComponent;
  let fixture: ComponentFixture<TLS24050CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS24050CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS24050CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
