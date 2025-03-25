import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN29090Component } from './fin29090.component';

describe('FIN29090Component', () => {
  let component: FIN29090Component;
  let fixture: ComponentFixture<FIN29090Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN29090Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN29090Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
