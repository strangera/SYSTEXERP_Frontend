import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN29080Component } from './fin29080.component';

describe('FIN29080Component', () => {
  let component: FIN29080Component;
  let fixture: ComponentFixture<FIN29080Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN29080Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN29080Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
