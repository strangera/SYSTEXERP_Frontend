import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN29060Component } from './fin29060.component';

describe('FIN29060Component', () => {
  let component: FIN29060Component;
  let fixture: ComponentFixture<FIN29060Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN29060Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN29060Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
