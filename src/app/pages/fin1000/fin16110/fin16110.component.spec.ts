import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN16110Component } from './fin16110.component';

describe('FIN16110Component', () => {
  let component: FIN16110Component;
  let fixture: ComponentFixture<FIN16110Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN16110Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN16110Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
