import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN32030Component } from './fin32030.component';

describe('FIN32030Component', () => {
  let component: FIN32030Component;
  let fixture: ComponentFixture<FIN32030Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN32030Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN32030Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
