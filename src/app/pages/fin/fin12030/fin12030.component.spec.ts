import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN12030Component } from './fin12030.component';

describe('FIN12030Component', () => {
  let component: FIN12030Component;
  let fixture: ComponentFixture<FIN12030Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN12030Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN12030Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
