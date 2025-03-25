import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN16070Component } from './fin16070.component';

describe('FIN16070Component', () => {
  let component: FIN16070Component;
  let fixture: ComponentFixture<FIN16070Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN16070Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN16070Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
