import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RelatedCardComponent } from './related-card.component';

describe('RelatedCardComponent', () => {
  let component: RelatedCardComponent;
  let fixture: ComponentFixture<RelatedCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RelatedCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RelatedCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
