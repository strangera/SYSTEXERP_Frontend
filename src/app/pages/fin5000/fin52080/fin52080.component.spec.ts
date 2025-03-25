import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN52080Component } from './fin52080.component';

describe('FIN52080Component', () => {
  let component: FIN52080Component;
  let fixture: ComponentFixture<FIN52080Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN52080Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN52080Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
