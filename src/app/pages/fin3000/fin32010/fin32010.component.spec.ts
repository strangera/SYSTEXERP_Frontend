import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN32010Component } from './fin32010.component';

describe('FIN32010Component', () => {
  let component: FIN32010Component;
  let fixture: ComponentFixture<FIN32010Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN32010Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN32010Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
