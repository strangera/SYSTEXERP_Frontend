import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN16080Component } from './fin16080.component';

describe('FIN16080Component', () => {
  let component: FIN16080Component;
  let fixture: ComponentFixture<FIN16080Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN16080Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN16080Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
