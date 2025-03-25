import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN42020Component } from './fin42020.component';

describe('FIN42020Component', () => {
  let component: FIN42020Component;
  let fixture: ComponentFixture<FIN42020Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN42020Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN42020Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
