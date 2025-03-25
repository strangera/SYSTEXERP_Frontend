import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN34020Component } from './fin34020.component';

describe('FIN34020Component', () => {
  let component: FIN34020Component;
  let fixture: ComponentFixture<FIN34020Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN34020Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN34020Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
