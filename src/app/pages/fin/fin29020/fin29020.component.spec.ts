import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN29020Component } from './fin29020.component';

describe('FIN29020Component', () => {
  let component: FIN29020Component;
  let fixture: ComponentFixture<FIN29020Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN29020Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN29020Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
