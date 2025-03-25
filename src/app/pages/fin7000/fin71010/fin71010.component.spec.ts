import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN71010Component } from './fin71010.component';

describe('FIN71010Component', () => {
  let component: FIN71010Component;
  let fixture: ComponentFixture<FIN71010Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN71010Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN71010Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
