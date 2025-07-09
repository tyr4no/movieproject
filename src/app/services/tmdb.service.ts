import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class TmdbService {
  private apiKey = '3769dd92ba5da57299c6399f85cfd575';
  private baseUrl = 'https://api.themoviedb.org/3';

  constructor(private http: HttpClient) {}

  // —————————————————————————————————————————————
  // Movies
  // —————————————————————————————————————————————

  /** Get full movie details (videos, etc.).
   *  `include_adult` is not supported on this endpoint, so it's omitted. */
  getMovieById(id: number): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/movie/${id}?api_key=${this.apiKey}&append_to_response=videos`
    );
  }

  /** Search for a movie by exact title, including adult titles. */
  getMovieByTitle(title: string): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/search/movie?api_key=${this.apiKey}` +
        `&query=${encodeURIComponent(title)}` +
        `&include_adult=true`
    );
  }
  isAdultCertification(meaning: string): boolean {
  const adultKeywords = [
    'nudity', 'sex', 'sexuality', 'explicit', 'graphic',
    'profanity', 'drug', 'violence', 'horror', 'gore', 'strong language'
  ];
  const meaningLower = meaning.toLowerCase();
  return adultKeywords.some(keyword => meaningLower.includes(keyword));
}

processReleaseDates(results: any[]): any {
  const flaggedCertifications: any = {};

  results.forEach((countryEntry: any) => {
    const country = countryEntry.iso_3166_1;
    flaggedCertifications[country] = countryEntry.release_dates.map((entry: any) => ({
      ...entry,
      adult: entry.meaning ? this.isAdultCertification(entry.meaning) : false
    }));
  });

  return flaggedCertifications;
}

  /** Get general movie details. Adult parameter is not valid here. */
  getMovieDetails(movieId: number): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/movie/${movieId}?api_key=${this.apiKey}&language=en-US`
    );
  }
getMovieCertificationsList() {
  return this.http.get(
    'https://api.themoviedb.org/3/certification/movie/list?api_key=3769dd92ba5da57299c6399f85cfd575'
  );
}

getTvCertificationsList() {
  return this.http.get(
    'https://api.themoviedb.org/3/certification/tv/list?api_key=3769dd92ba5da57299c6399f85cfd575'
  );
}
  /** Get the cast of a movie. */
  getMovieCredits(movieId: number) {
    return this.http.get(
      `${this.baseUrl}/movie/${movieId}/credits?api_key=${this.apiKey}`
    );
  }

  /** Fetch movie trailers; include adult to allow adult‐only trailers if any. */
  getMovieTrailer(movieId: number): Observable<string | null> {
    return this.http
      .get<any>(
        `${this.baseUrl}/movie/${movieId}/videos?api_key=${this.apiKey}` +
          `&language=en-US&include_adult=true`
      )
      .pipe(
        map((res) => {
          const trailer = (res.results || []).find(
            (v: any) => v.type === 'Trailer' && v.site === 'YouTube'
          );
          return trailer ? trailer.key : null;
        })
      );
  }

  /** Top‐rated movies (include adult). */
  getTopRatedMovies(): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/movie/top_rated?api_key=${this.apiKey}` +
        `&include_adult=true`
    );
  }

  /** Discover movies by genre, including adult. */
  getMoviesByGenre(genreId: number): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/discover/movie?api_key=${this.apiKey}` +
        `&with_genres=${genreId}` +
        `&include_adult=true`
    );
  }
  /** Discover movies by multiple genres (comma-separated), including adult. */
  getMoviesByGenres(genreIds: number[]): Observable<any> {
    const genreParam = genreIds.join(',');
    return this.http.get(
      `${this.baseUrl}/discover/movie?api_key=${this.apiKey}` +
        `&with_genres=${genreParam}` +
        `&include_adult=true`
    );
  }
  getMovieGenres(): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/genre/movie/list?api_key=${this.apiKey}&language=en-US`
    );
  }
  getTvGenres(): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/genre/tv/list?api_key=${this.apiKey}`
    );
  }

  getFilteredMovies(filters: any): Observable<any> {
    const genreParam = filters.genres.join(',');
    const yearStart = filters.yearRange[0];
    const yearEnd = filters.yearRange[1];
    const adult = filters.includeAdult;

    return this.http.get(
      `${this.baseUrl}/discover/movie?api_key=${this.apiKey}` +
        `&with_genres=${genreParam}` +
        `&primary_release_date.gte=${yearStart}-01-01` +
        `&primary_release_date.lte=${yearEnd}-12-31` +
        `&vote_average.gte=${filters.minRating}` +
        `&include_adult=${adult}`
    );
  }
  getTVDetails(tvId: number) {
  return this.http.get(`${this.baseUrl}/tv/${tvId}?api_key=${this.apiKey}&language=en-US`);
}

getSeasonEpisodes(tvId: number, seasonNumber: number) {
  return this.http.get(`${this.baseUrl}/tv/${tvId}/season/${seasonNumber}?api_key=${this.apiKey}&language=en-US`);
}

  getFilteredTvShows(filters: any): Observable<any> {
    const genreParam = filters.genres.join(',');
    const yearStart = filters.yearRange[0];
    const yearEnd = filters.yearRange[1];
    const adult = filters.includeAdult;

    return this.http.get(
      `${this.baseUrl}/discover/tv?api_key=${this.apiKey}` +
        `&with_genres=${genreParam}` +
        `&first_air_date.gte=${yearStart}-01-01` +
        `&first_air_date.lte=${yearEnd}-12-31` +
        `&vote_average.gte=${filters.minRating}` +
        `&include_adult=${adult}`
    );
  }

  getTvShowsByGenres(genreIds: number[]): Observable<any> {
    const genreParam = genreIds.join(',');
    return this.http.get(
      `${this.baseUrl}/discover/tv?api_key=${this.apiKey}` +
        `&with_genres=${genreParam}` +
        `&include_adult=true`
    );
  }

  /** Search movies by a free‐text query, including adult. */
  searchMovies(query: string): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/search/movie?api_key=${this.apiKey}` +
        `&query=${encodeURIComponent(query)}` +
        `&include_adult=true`
    );
  }

  /** Multi‐search (movies + TV + people), including adult. */
  searchMulti(query: string): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/search/multi?api_key=${this.apiKey}` +
        `&query=${encodeURIComponent(query)}` +
        `&include_adult=true`
    );
  }

  // —————————————————————————————————————————————
  // TV Shows
  // —————————————————————————————————————————————

  /** Get TV show details. (Adult filter not supported here.) */
  getTvDetails(tvId: number): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/tv/${tvId}?api_key=${this.apiKey}&language=en-US`
    );
  }

  /** Get the cast of a TV show. */
  getTvCredits(id: number) {
    return this.http.get(
      `${this.baseUrl}/tv/${id}/credits?api_key=${this.apiKey}`
    );
  }

  /** Fetch TV show trailer (include adult to allow restricted content). */
  getTvTrailer(tvId: number): Observable<string | null> {
    return this.http
      .get<any>(
        `${this.baseUrl}/tv/${tvId}/videos?api_key=${this.apiKey}` +
          `&language=en-US&include_adult=true`
      )
      .pipe(
        map((res) => {
          const trailer = (res.results || []).find(
            (v: any) => v.type === 'Trailer' && v.site === 'YouTube'
          );
          return trailer ? trailer.key : null;
        })
      );
  }

  /** Top‐rated TV shows (include adult). */
  getTopRatedTvShows(): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/tv/top_rated?api_key=${this.apiKey}` +
        `&include_adult=true`
    );
  }

  /** Discover TV shows by genre, including adult. */
  getTvShowsByGenre(genreId: number): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/discover/tv?api_key=${this.apiKey}` +
        `&with_genres=${genreId}` +
        `&include_adult=true`
    );
  }

  /** Search TV shows by query, including adult. */
  searchTvShows(query: string): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/search/tv?api_key=${this.apiKey}` +
        `&query=${encodeURIComponent(query)}` +
        `&include_adult=true`
    );
  }

  /** Search for a TV show by exact title, including adult. */
  getTvByTitle(title: string): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/search/tv?api_key=${this.apiKey}` +
        `&query=${encodeURIComponent(title)}` +
        `&include_adult=true`
    );
  }
  getMovieCertifications(movieId: number): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/movie/${movieId}/release_dates?api_key=${this.apiKey}`
    );
  }

  /** Fetch content ratings for a given TV show ID. */
  getTvCertifications(tvId: number): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/tv/${tvId}/content_ratings?api_key=${this.apiKey}`
    );
  }
  
}
