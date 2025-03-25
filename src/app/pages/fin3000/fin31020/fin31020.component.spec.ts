import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN31020Component } from './fin31020.component';

describe('FIN31020Component', () => {
  let component: FIN31020Component;
  let fixture: ComponentFixture<FIN31020Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN31020Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN31020Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
