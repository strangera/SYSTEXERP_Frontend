import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN55040Component } from './fin55040.component';

describe('FIN55040Component', () => {
  let component: FIN55040Component;
  let fixture: ComponentFixture<FIN55040Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN55040Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN55040Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
