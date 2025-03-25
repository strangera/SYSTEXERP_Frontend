import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS26020CRUComponent } from './tls26020-cru.component';

describe('TLS26020CRUComponent', () => {
  let component: TLS26020CRUComponent;
  let fixture: ComponentFixture<TLS26020CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS26020CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS26020CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
