import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN16010Component } from './fin16010.component';

describe('FIN16010Component', () => {
  let component: FIN16010Component;
  let fixture: ComponentFixture<FIN16010Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN16010Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN16010Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
