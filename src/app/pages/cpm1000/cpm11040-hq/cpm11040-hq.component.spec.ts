import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Cpm11040HQComponent } from './cpm11040-hq.component';

describe('Cpm11040HQComponent', () => {
  let component: Cpm11040HQComponent;
  let fixture: ComponentFixture<Cpm11040HQComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Cpm11040HQComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Cpm11040HQComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
