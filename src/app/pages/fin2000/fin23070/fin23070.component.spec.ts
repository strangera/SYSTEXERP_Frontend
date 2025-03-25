import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN23070Component } from './fin23070.component';

describe('FIN23070Component', () => {
  let component: FIN23070Component;
  let fixture: ComponentFixture<FIN23070Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN23070Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN23070Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
