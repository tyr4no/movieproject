import {
  Component,
  Input,
  Output,
  OnInit,
  EventEmitter,
  OnDestroy,
} from '@angular/core';
import { TmdbService } from '../services/tmdb.service';
import { UserService } from '../user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'movie-and-tv-card',
  templateUrl: './movie-and-tv-card.component.html',
  styleUrls: ['./movie-and-tv-card.component.css'],
})
export class MovieAndTvCardComponent implements OnInit, OnDestroy {
  @Input() movie!: any; // Either a movie or TV‐show object
  @Input() isSearch: string = '';
  @Input() showRating: boolean = true;
  @Input() isFiltered: boolean = false;

  @Output() trailer = new EventEmitter<any>();
  @Output() verifyRequested = new EventEmitter<void>();
  askedToFetch = false;
  loading = true;
  cast: string[] = [];
  type: 'movie' | 'tv' = 'movie';

  /** Holds the certification string (e.g. "R", "PG-13", "TV-MA", "18+") */
  certification: string | null = null;

  /** Subscriptions for global flags */
  private isAdultSub!: Subscription;
  private wentThroughVerificationSub!: Subscription;

  /** Local copies of those flags */
  isAdult: boolean = false;
  wentThroughVerification: boolean = false;

  constructor(
    private tmdbService: TmdbService,
    public userService: UserService
  ) {}

  ngOnInit() {
    // 1) Subscribe to global isAdult BehaviorSubject
    this.isAdultSub = this.userService.isAdult.subscribe((val) => {
      this.isAdult = val;
    });

    // 2) Subscribe to wentThroughVerification if you track that
    this.wentThroughVerificationSub =
      this.userService.wentThroughVerification.subscribe((val) => {
        this.wentThroughVerification = val;
      });

    // 3) Only proceed if `movie` exists and has an ID
    if (this.movie && this.movie.id) {
      // console.log(this.movie)
      // Determine if this is a movie or TV show
      if (this.movie.media_type) {
        this.type = this.movie.media_type;
      } else {
        const path = window.location.pathname;
        this.type = path.includes('tv-shows') ? 'tv' : 'movie';
      }

      // 4) Fetch certification based on type
      if (this.type === 'movie') {
        this.tmdbService
          .getMovieCertifications(this.movie.id)
          .subscribe((res: any) => {
            const usEntry = res.results.find((r: any) => r.iso_3166_1 === 'US');
            if (usEntry && usEntry.release_dates.length > 0) {
              this.certification =
                usEntry.release_dates[0].certification || null;
            }
            this.loading = false;
          });
      } else {
        this.tmdbService
          .getTvCertifications(this.movie.id)
          .subscribe((res: any) => {
            const usEntry = res.results.find((r: any) => r.iso_3166_1 === 'US');
            this.certification = usEntry ? usEntry.rating : null;

            this.loading = false;
          });
      }

      // 5) Load cast & details as before
      // this.loadCredits();
      // this.loadDetails();
    }
  }

  ngOnDestroy() {
    this.isAdultSub.unsubscribe();
    this.wentThroughVerificationSub.unsubscribe();
  }
  loadExtraData() {
    if (this.loadsDone < 2) {
      this.askedToFetch = true;

      this.loadCredits();
      this.loadDetails();
    }
  }
  private loadCredits() {
    const creditsObs =
      this.type === 'movie'
        ? this.tmdbService.getMovieCredits(this.movie.id)
        : this.tmdbService.getTvCredits(this.movie.id);

    creditsObs.subscribe((credits: any) => {
      this.cast = credits.cast.map((actor: any) => actor.name);
      credits = null;

      this.checkIfLoaded();
    });
  }

  private loadDetails() {
    const detailsObs =
      this.type === 'movie'
        ? this.tmdbService.getMovieDetails(this.movie.id)
        : this.tmdbService.getTvDetails(this.movie.id);

    detailsObs.subscribe((details: any) => {
      if (details.homepage) {
        this.movie.homepage = details.homepage;
      }
      details = null;
      this.checkIfLoaded();
    });
  }

  /** Called when user clicks the eye-slash icon */
  verifyAge() {
    this.verifyRequested.emit();
  }

  emitTrailer(id: number) {
    this.trailer.emit(id);
  }

  loadsDone = 0;
  private checkIfLoaded() {
    this.loadsDone++;
    if (this.loadsDone === 2) {
      this.askedToFetch = false;
      this.loading = false;
    }
  }

  /**
   * Return true if this certification should be treated as adult-only.
   * (Here we include G/PG/TV-14 etc. just for testing; adjust as needed.)
   */
  isCertificationAdult(cert: string | null): boolean {
    if (!cert) return false;
    const c = cert.trim().toUpperCase();
    const adultRatings = [
      'G',
      'PG',
      'R',
      'TV-Y',
      'TV-Y7',
      'TV-G',
      'TV-PG',
      'TV-14',
      '18+',
      '18',
      'M',
      'AO',
    ];
    return adultRatings.includes(c);
  }
}
