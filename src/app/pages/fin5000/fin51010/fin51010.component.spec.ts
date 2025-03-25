import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN51010Component } from './fin51010.component';

describe('FIN51010Component', () => {
  let component: FIN51010Component;
  let fixture: ComponentFixture<FIN51010Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN51010Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN51010Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
