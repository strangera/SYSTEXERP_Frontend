import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN65010Component } from './fin65010.component';

describe('FIN65010Component', () => {
  let component: FIN65010Component;
  let fixture: ComponentFixture<FIN65010Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN65010Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN65010Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
