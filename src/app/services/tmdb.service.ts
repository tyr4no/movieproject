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

  /** Get general movie details. Adult parameter is not valid here. */
  getMovieDetails(movieId: number): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/movie/${movieId}?api_key=${this.apiKey}&language=en-US`
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
