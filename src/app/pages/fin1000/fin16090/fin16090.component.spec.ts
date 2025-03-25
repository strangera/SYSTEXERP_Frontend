import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN16090Component } from './fin16090.component';

describe('FIN16090Component', () => {
  let component: FIN16090Component;
  let fixture: ComponentFixture<FIN16090Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN16090Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN16090Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
