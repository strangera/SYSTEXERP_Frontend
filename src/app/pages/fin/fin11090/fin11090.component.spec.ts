import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN11090Component } from './fin11090.component';

describe('FIN11090Component', () => {
  let component: FIN11090Component;
  let fixture: ComponentFixture<FIN11090Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN11090Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN11090Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
