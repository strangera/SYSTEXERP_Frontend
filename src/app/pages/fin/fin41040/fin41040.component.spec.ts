import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN41040Component } from './fin41040.component';

describe('FIN41040Component', () => {
  let component: FIN41040Component;
  let fixture: ComponentFixture<FIN41040Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN41040Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN41040Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
