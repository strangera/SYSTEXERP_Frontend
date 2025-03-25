import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2K020CRUComponent } from './tls2k020-cru.component';

describe('TLS2K020CRUComponent', () => {
  let component: TLS2K020CRUComponent;
  let fixture: ComponentFixture<TLS2K020CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2K020CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2K020CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
