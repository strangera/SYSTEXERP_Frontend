import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN55130Component } from './fin55130.component';

describe('FIN55130Component', () => {
  let component: FIN55130Component;
  let fixture: ComponentFixture<FIN55130Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN55130Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN55130Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
