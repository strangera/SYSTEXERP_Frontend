import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN42050Component } from './fin42050.component';

describe('FIN42050Component', () => {
  let component: FIN42050Component;
  let fixture: ComponentFixture<FIN42050Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN42050Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN42050Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
