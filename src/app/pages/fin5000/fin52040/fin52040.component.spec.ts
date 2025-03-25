import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN52040Component } from './fin52040.component';

describe('FIN52040Component', () => {
  let component: FIN52040Component;
  let fixture: ComponentFixture<FIN52040Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN52040Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN52040Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
