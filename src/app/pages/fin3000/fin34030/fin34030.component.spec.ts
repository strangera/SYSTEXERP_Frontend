import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN34030Component } from './fin34030.component';

describe('FIN34030Component', () => {
  let component: FIN34030Component;
  let fixture: ComponentFixture<FIN34030Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN34030Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN34030Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
