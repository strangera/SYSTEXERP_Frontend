import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN22020Component } from './fin22020.component';

describe('FIN22020Component', () => {
  let component: FIN22020Component;
  let fixture: ComponentFixture<FIN22020Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN22020Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN22020Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
