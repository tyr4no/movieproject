import {
  Component,
  Input,
  Output,
  OnInit,
  OnDestroy,
  EventEmitter,
} from '@angular/core';
import { TmdbService } from '../services/tmdb.service';

@Component({
  selector: 'movie-and-tv-card',
  templateUrl: './movie-and-tv-card.component.html',
  styleUrl: './movie-and-tv-card.component.css',
})
export class MovieAndTvCardComponent implements OnInit {
  @Input() movie: any;
  @Input() showRating: boolean = true;
  @Output() trailer = new EventEmitter<any>();
  loading: boolean = true;

  cast: string[] = [];
  genres: string[] = [];
  type: string = 'movie';


  constructor(private tmdbService: TmdbService) {}

  ngOnInit() {
    // Use media_type if available (homepage), else fallback to route detection
    if (this.movie && this.movie.media_type) {
      this.type = this.movie.media_type;
    } else {
      const path = window.location.pathname;
      this.type = path.includes('tv-shows') ? 'tv' : 'movie';
    }

    if (this.movie && this.movie.id) {
      this.loadCredits();
      this.loadDetails();
    }
  }

  loadCredits() {
    const creditsObs =
      this.type === 'movie'
        ? this.tmdbService.getMovieCredits(this.movie.id)
        : this.tmdbService.getTvCredits(this.movie.id);

    creditsObs.subscribe((res: any) => {
      this.cast = res.cast.map((actor: any) => actor.name);
      this.checkIfLoaded();
    });
  }

  loadDetails() {
    const detailsObs =
      this.type === 'movie'
        ? this.tmdbService.getMovieDetails(this.movie.id)
        : this.tmdbService.getTvDetails(this.movie.id);

    detailsObs.subscribe((details: any) => {
      if (details.overview) {
        this.movie.overview = details.overview;
      }
      if (details.genres) {
        this.genres = details.genres.map((g: any) => g.name).slice(0, 3);
      }
      if (details.homepage) {
        this.movie.homepage = details.homepage;
      }
        this.checkIfLoaded();
    });
  }

  private loadsDone = 0;
  checkIfLoaded() {
    this.loadsDone++;
    if (this.loadsDone === 2) {
      this.loading = false;
    }
  }

  emitTrailer(id: number) {
    this.trailer.emit(id);
  }
}
