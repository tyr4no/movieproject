import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class TmdbService {
  private apiKey = '3769dd92ba5da57299c6399f85cfd575';
  private baseUrl = 'https://api.themoviedb.org/3';

  constructor(private http: HttpClient) {}

  // Movies

  getMovieById(id: number): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/movie/${id}?api_key=${this.apiKey}&append_to_response=videos`
    );
  }
getTvCredits(id: number) {
  return this.http.get(`${this.baseUrl}/tv/${id}/credits?api_key=${this.apiKey}`);
}

// New Method to get movie by exact title
getMovieByTitle(title: string): Observable<any> {
  return this.http.get(
    `${this.baseUrl}/search/movie?api_key=${this.apiKey}&query=${encodeURIComponent(title)}`
  );
}


  getMovieDetails(movieId: number): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/movie/${movieId}?api_key=${this.apiKey}&language=en-US`
    );
  }
  getMovieCredits(movieId: number) {
  return this.http.get(`${this.baseUrl}/movie/${movieId}/credits?api_key=${this.apiKey}`);
}

  getTvTrailer(tvId: number): Observable<string | null> {
    return this.http
      .get<any>(
        `${this.baseUrl}/tv/${tvId}/videos?api_key=${this.apiKey}&language=en-US`
      )
      .pipe(
        map((res) => {
          console.log(res);
          const trailer = (res.results || []).find(
            (v: any) => v.type === 'Trailer' && v.site === 'YouTube'
          );
          return trailer ? trailer.key : null;
        })
      );
  }
  getMovieTrailer(movieId: number): Observable<string | null> {
    return this.http
      .get<any>(
        `${this.baseUrl}/movie/${movieId}/videos?api_key=${this.apiKey}&language=en-US`
      )
      .pipe(
        map((res) => {
          const trailer = res.results.find(
            (v: any) => v.type === 'Trailer' && v.site === 'YouTube'
          );
          return trailer ? trailer.key : null;
        })
      );
  }

  getTopRatedMovies(): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/movie/top_rated?api_key=${this.apiKey}`
    );
  }

  getMoviesByGenre(genreId: number): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/discover/movie?api_key=${this.apiKey}&with_genres=${genreId}`
    );
  }


  searchMovies(query: string): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/search/movie?api_key=${this.apiKey}&query=${query}`
    );
  }
searchMulti(query: string): Observable<any> {
  return this.http.get(
    `${this.baseUrl}/search/multi?api_key=${this.apiKey}&query=${query}`
  );
}
  // TV Shows
  getTvShowsByGenre(genreId: number): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/discover/tv?api_key=${this.apiKey}&with_genres=${genreId}`
    );
  }

  getTopRatedTvShows(): Observable<any> {
    return this.http.get(`${this.baseUrl}/tv/top_rated?api_key=${this.apiKey}`);
  }

  getTvDetails(tvId: number): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/tv/${tvId}?api_key=${this.apiKey}&language=en-US`
    );
  }
  searchTvShows(query: string): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/search/tv?api_key=${this.apiKey}&query=${query}`
    );
  }
  getTvByTitle(title: string): Observable<any> {
  return this.http.get(
    `${this.baseUrl}/search/tv?api_key=${this.apiKey}&query=${encodeURIComponent(title)}`
  );
}

}
