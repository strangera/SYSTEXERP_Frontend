import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN73040Component } from './fin73040.component';

describe('FIN73040Component', () => {
  let component: FIN73040Component;
  let fixture: ComponentFixture<FIN73040Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN73040Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN73040Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
