import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS22020CRUComponent } from './tls22020-cru.component';

describe('TLS22020CRUComponent', () => {
  let component: TLS22020CRUComponent;
  let fixture: ComponentFixture<TLS22020CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS22020CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS22020CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
