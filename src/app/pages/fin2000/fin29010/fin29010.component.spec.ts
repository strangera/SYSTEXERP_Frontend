import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN29010Component } from './fin29010.component';

describe('FIN29010Component', () => {
  let component: FIN29010Component;
  let fixture: ComponentFixture<FIN29010Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN29010Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN29010Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
