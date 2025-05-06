import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN54040Component } from './fin54040.component';

describe('FIN54040Component', () => {
  let component: FIN54040Component;
  let fixture: ComponentFixture<FIN54040Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN54040Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN54040Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
