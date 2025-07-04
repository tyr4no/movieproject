import * as movieCertifications from '../movieapi.json';
import * as tvCertifications from '../tvapi.json';

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
  @Input() movie!: any;
  @Input() isSearch: string = '';
  @Input() showRating: boolean = true;
  @Input() isFiltered: boolean = false;

  @Output() trailer = new EventEmitter<any>();
  @Output() verifyRequested = new EventEmitter<void>();
  apiCallCount = 0;
  askedToFetch = false;
  loading = true;
  cast: string[] = [];
  type: 'movie' | 'tv' = 'movie';

  certification: string | null = null;
  shouldBlur: boolean = false;

  private isAdultSub!: Subscription;
  private wentThroughVerificationSub!: Subscription;

  isAdult: boolean = false;
  wentThroughVerification: boolean = false;

  constructor(
    private tmdbService: TmdbService,
    public userService: UserService
  ) {}

  ngOnInit() {
    this.isAdultSub = this.userService.isAdult.subscribe((val) => {
      this.isAdult = val;
    });

    this.wentThroughVerificationSub =
      this.userService.wentThroughVerification.subscribe((val) => {
        this.wentThroughVerification = val;
      });

    if (this.movie && this.movie.id) {
      this.type =
        this.movie.media_type ||
        (window.location.pathname.includes('tv-shows') ? 'tv' : 'movie');

      if (this.type === 'movie') {
        this.tmdbService
          .getMovieCertifications(this.movie.id)
          .subscribe((res: any) => {
            this.certification = this.getAdultCertificationFromResults(
              res.results,
              'movie'
            );
            this.loading = false;
          });
      } else {
        this.tmdbService
          .getTvCertifications(this.movie.id)
          .subscribe((res: any) => {
            this.certification = this.getAdultCertificationFromResults(
              res.results,
              'tv'
            );
            this.loading = false;
          });
      }
    }
  }

  ngOnDestroy() {
    this.isAdultSub.unsubscribe();
    this.wentThroughVerificationSub.unsubscribe();
  }

  loadExtraData() {
    if (this.loadsDone < 2) {
      this.loadCredits();
      this.loadDetails();
      this.askedToFetch = true;
      this.apiCallCount++;
    }
  }

  private loadCredits() {
    const creditsObs =
      this.type === 'movie'
        ? this.tmdbService.getMovieCredits(this.movie.id)
        : this.tmdbService.getTvCredits(this.movie.id);

    creditsObs.subscribe((credits: any) => {
      this.cast = credits.cast.map((actor: any) => actor.name);
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
      this.checkIfLoaded();
    });
  }

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

  private getAdultCertificationFromResults(
    results: any[],
    type: 'movie' | 'tv'
  ): string | null {
    const certificationData =
      type === 'movie'
        ? (movieCertifications as any).certifications
        : (tvCertifications as any).certifications;

    // If no results at all, blur as precaution
    if (!results || results.length === 0) {
      this.shouldBlur = true;
      return null;
    }

    // Check all available country entries
    for (const countryEntry of results) {
      const countryCode = countryEntry.iso_3166_1;
      const certsForCountry = certificationData[countryCode];

      if (!certsForCountry) continue;

      if (type === 'movie') {
        const releaseDates = countryEntry.release_dates || [];

        // If no release dates but entry exists, treat as empty certification
        if (releaseDates.length === 0) {
          this.shouldBlur = true;
          return '';
        }

        for (const release of releaseDates) {
          const cert = release.certification?.trim();

          // Explicit empty certification check
          if (cert === '') {
            this.shouldBlur = true;
            return '';
          }

          if (!cert) continue;

          const foundCert = certsForCountry.find(
            (entry: any) =>
              entry.certification.trim().toUpperCase() === cert.toUpperCase()
          );

          if (foundCert) {
            this.shouldBlur = foundCert.adult;
            return foundCert.adult ? cert : null;
          }
        }
      } else {
        const rating = countryEntry.rating?.trim();

        // Explicit empty rating check
        if (rating === '') {
          this.shouldBlur = true;
          return '';
        }

        if (!rating) continue;

        const foundCert = certsForCountry.find(
          (entry: any) =>
            entry.certification.trim().toUpperCase() === rating.toUpperCase()
        );

        if (foundCert) {
          this.shouldBlur = foundCert.adult;
          return foundCert.adult ? rating : null;
        }
      }
    }

    // If we checked all countries but found no matching certifications
    this.shouldBlur = true;
    return null;
  }

  isCertificationAdult(cert: string | null): boolean {
    // Returns true for:
    // - Adult certifications (non-null string)
    // - Empty certifications ('')
    // - Unknown certifications (null)
    return cert !== null;
  }
  /** Correctly resolves primary country per type */
}
