import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN42010Component } from './fin42010.component';

describe('FIN42010Component', () => {
  let component: FIN42010Component;
  let fixture: ComponentFixture<FIN42010Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN42010Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN42010Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
