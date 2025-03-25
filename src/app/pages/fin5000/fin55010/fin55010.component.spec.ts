import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN55010Component } from './fin55010.component';

describe('FIN55010Component', () => {
  let component: FIN55010Component;
  let fixture: ComponentFixture<FIN55010Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN55010Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN55010Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
