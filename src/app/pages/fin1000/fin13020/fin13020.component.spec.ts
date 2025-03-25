import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN13020Component } from './fin13020.component';

describe('FIN13020Component', () => {
  let component: FIN13020Component;
  let fixture: ComponentFixture<FIN13020Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN13020Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN13020Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
