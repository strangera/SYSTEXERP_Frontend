import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN15020Component } from './fin15020.component';

describe('FIN15020Component', () => {
  let component: FIN15020Component;
  let fixture: ComponentFixture<FIN15020Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN15020Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN15020Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
