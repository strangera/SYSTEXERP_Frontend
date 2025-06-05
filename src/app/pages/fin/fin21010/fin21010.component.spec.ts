import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN21010Component } from './fin21010.component';

describe('FIN21010Component', () => {
  let component: FIN21010Component;
  let fixture: ComponentFixture<FIN21010Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN21010Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN21010Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
