import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN14080Component } from './fin14080.component';

describe('FIN14080Component', () => {
  let component: FIN14080Component;
  let fixture: ComponentFixture<FIN14080Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN14080Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN14080Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
