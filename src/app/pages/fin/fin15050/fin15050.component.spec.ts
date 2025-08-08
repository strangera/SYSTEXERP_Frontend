import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN15050Component } from './fin15050.component';

describe('FIN15050Component', () => {
  let component: FIN15050Component;
  let fixture: ComponentFixture<FIN15050Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN15050Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN15050Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
