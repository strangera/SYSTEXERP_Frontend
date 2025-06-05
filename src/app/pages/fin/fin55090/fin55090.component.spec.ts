import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN55090Component } from './fin55090.component';

describe('FIN55090Component', () => {
  let component: FIN55090Component;
  let fixture: ComponentFixture<FIN55090Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN55090Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN55090Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
