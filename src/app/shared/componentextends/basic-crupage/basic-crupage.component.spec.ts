import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BasicCrupageComponent } from './basic-crupage.component';

describe('BasicCrupageComponent', () => {
  let component: BasicCrupageComponent;
  let fixture: ComponentFixture<BasicCrupageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BasicCrupageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BasicCrupageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
