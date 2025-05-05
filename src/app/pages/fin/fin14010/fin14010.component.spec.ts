import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN14010Component } from './fin14010.component';

describe('FIN14010Component', () => {
  let component: FIN14010Component;
  let fixture: ComponentFixture<FIN14010Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN14010Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN14010Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
