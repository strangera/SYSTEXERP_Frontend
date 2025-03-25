import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN15040Component } from './fin15040.component';

describe('FIN15040Component', () => {
  let component: FIN15040Component;
  let fixture: ComponentFixture<FIN15040Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN15040Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN15040Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
