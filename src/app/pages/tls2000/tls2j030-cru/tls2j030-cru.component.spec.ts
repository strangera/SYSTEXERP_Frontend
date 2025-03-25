import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2J030CRUComponent } from './tls2j030-cru.component';

describe('TLS2J030CRUComponent', () => {
  let component: TLS2J030CRUComponent;
  let fixture: ComponentFixture<TLS2J030CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2J030CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2J030CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
