import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN25020Component } from './fin25020.component';

describe('FIN25020Component', () => {
  let component: FIN25020Component;
  let fixture: ComponentFixture<FIN25020Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN25020Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN25020Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
