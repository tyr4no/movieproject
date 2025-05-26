import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MovieAndTvCardComponent } from './movie-and-tv-card.component';

describe('MovieAndTvCardComponent', () => {
  let component: MovieAndTvCardComponent;
  let fixture: ComponentFixture<MovieAndTvCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MovieAndTvCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MovieAndTvCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
