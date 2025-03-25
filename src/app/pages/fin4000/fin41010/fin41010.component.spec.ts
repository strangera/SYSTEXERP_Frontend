import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN41010Component } from './fin41010.component';

describe('FIN41010Component', () => {
  let component: FIN41010Component;
  let fixture: ComponentFixture<FIN41010Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN41010Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN41010Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
