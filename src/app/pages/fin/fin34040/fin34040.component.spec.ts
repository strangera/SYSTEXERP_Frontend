import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN34040Component } from './fin34040.component';

describe('FIN34040Component', () => {
  let component: FIN34040Component;
  let fixture: ComponentFixture<FIN34040Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN34040Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN34040Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
