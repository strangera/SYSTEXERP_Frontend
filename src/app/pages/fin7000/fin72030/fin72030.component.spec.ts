import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN72030Component } from './fin72030.component';

describe('FIN72030Component', () => {
  let component: FIN72030Component;
  let fixture: ComponentFixture<FIN72030Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN72030Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN72030Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
