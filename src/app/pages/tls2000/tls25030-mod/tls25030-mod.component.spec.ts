import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS25030ModComponent } from './tls25030-mod.component';

describe('TLS25030ModComponent', () => {
  let component: TLS25030ModComponent;
  let fixture: ComponentFixture<TLS25030ModComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS25030ModComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS25030ModComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
