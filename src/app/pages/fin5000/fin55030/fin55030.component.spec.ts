import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN55030Component } from './fin55030.component';

describe('FIN55030Component', () => {
  let component: FIN55030Component;
  let fixture: ComponentFixture<FIN55030Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN55030Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN55030Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
