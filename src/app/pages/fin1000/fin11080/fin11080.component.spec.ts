import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN11080Component } from './fin11080.component';

describe('FIN11080Component', () => {
  let component: FIN11080Component;
  let fixture: ComponentFixture<FIN11080Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN11080Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN11080Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
