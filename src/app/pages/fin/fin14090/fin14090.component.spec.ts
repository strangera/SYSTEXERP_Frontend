import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN14090Component } from './fin14090.component';

describe('FIN14090Component', () => {
  let component: FIN14090Component;
  let fixture: ComponentFixture<FIN14090Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN14090Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN14090Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
