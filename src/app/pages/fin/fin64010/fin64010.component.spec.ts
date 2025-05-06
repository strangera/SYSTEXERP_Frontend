import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN64010Component } from './fin64010.component';

describe('FIN64010Component', () => {
  let component: FIN64010Component;
  let fixture: ComponentFixture<FIN64010Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN64010Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN64010Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
