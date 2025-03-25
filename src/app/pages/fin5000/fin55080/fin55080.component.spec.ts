import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN55080Component } from './fin55080.component';

describe('FIN55080Component', () => {
  let component: FIN55080Component;
  let fixture: ComponentFixture<FIN55080Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN55080Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN55080Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
