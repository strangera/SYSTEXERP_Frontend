import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN51050Component } from './fin51050.component';

describe('FIN51050Component', () => {
  let component: FIN51050Component;
  let fixture: ComponentFixture<FIN51050Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN51050Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN51050Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
