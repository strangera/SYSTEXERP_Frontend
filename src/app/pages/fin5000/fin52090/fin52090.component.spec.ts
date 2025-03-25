import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN52090Component } from './fin52090.component';

describe('FIN52090Component', () => {
  let component: FIN52090Component;
  let fixture: ComponentFixture<FIN52090Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN52090Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN52090Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
