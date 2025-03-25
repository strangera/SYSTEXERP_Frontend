import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN34010Component } from './fin34010.component';

describe('FIN34010Component', () => {
  let component: FIN34010Component;
  let fixture: ComponentFixture<FIN34010Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN34010Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN34010Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
