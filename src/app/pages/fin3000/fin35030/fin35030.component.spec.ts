import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN35030Component } from './fin35030.component';

describe('FIN35030Component', () => {
  let component: FIN35030Component;
  let fixture: ComponentFixture<FIN35030Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN35030Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN35030Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
