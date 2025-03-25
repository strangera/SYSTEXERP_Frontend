import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN14040Component } from './fin14040.component';

describe('FIN14040Component', () => {
  let component: FIN14040Component;
  let fixture: ComponentFixture<FIN14040Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN14040Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN14040Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
