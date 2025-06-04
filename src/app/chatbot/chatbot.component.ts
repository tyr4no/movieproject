import { Component } from '@angular/core';
import { GeminiService } from '../gemini.service';
import { UserService } from '../user.service';
@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrl: './chatbot.component.css',
})
export class ChatbotComponent {
  chatVisible = false;
  userInput = '';
  messages: { user: string; gemini: string | null; loading: boolean }[] = [];
  constructor(
    private geminiService: GeminiService,
    private userService: UserService
  ) {}
  ngOnInit() {
    const loggedInUserId = localStorage.getItem('userId');
    if (loggedInUserId) {
      this.buildRecommendationPrompt(+loggedInUserId);
    }
  }
  conversationHistory: { role: string; parts: { text: string }[] }[] = [];

  private buildRecommendationPrompt(userId: number): void {
    this.userService.getUserById(userId).subscribe((user: any) => {
      const movieGenres = user.watchedMovies.flatMap((m: any) => m.genres);
      const showGenres = user.watchedTvShows.flatMap((s: any) => s.genres);
      const genres = [...new Set([...movieGenres, ...showGenres])];

      const movieYears = user.watchedMovies.map((m: any) => m.releaseYear);
      const showYears = user.watchedTvShows.map((s: any) => s.releaseYear);
      const allYears = [...movieYears, ...showYears];

      const movieLanguages = user.watchedMovies.map((m: any) => m.language);
      const showLanguages = user.watchedTvShows.map((s: any) => s.language);
      const languages = [...new Set([...movieLanguages, ...showLanguages])];

      const movieCharacters = user.watchedMovies.flatMap((m: any) =>
        m.mainCharacters.map((c: any) => c.name)
      );
      const showCharacters = user.watchedTvShows.flatMap((s: any) =>
        s.mainCharacters.map((c: any) => c.name)
      );
      const mainCharacters = [
        ...new Set([...movieCharacters, ...showCharacters]),
      ];

      const moviesWatched = user.watchedMovies.map(
        (m: any) =>
          `${m.title} (${m.releaseYear}) [${m.mainCharacters
            .map((c: any) => c.name)
            .join(', ')}]`
      );
      const showsWatched = user.watchedTvShows.map(
        (s: any) =>
          `${s.title} (${s.releaseYear}) [${s.mainCharacters
            .map((c: any) => c.name)
            .join(', ')}]`
      );

      const prompt = `
The user enjoys content in these genres: ${genres.join(', ')}.
Preferred languages: ${languages.join(', ')}.
Frequently watched movies: ${moviesWatched.join(', ')}.
Frequently watched TV shows: ${showsWatched.join(', ')}.
Frequently watched main characters/actors: ${mainCharacters.join(', ')}.

Considering this, suggest at least 20 popular movie and TV show titles, 10 for the movies and 10 for the shows, shuffled, that match at least 3 of these preferences.

Return titles as a comma-separated list.
Do not include any other information, explanations, or extra text.
`;

      this.conversationHistory.push({
        role: 'user',
        parts: [{ text: prompt }],
      });
      // You can now use the prompt variable as needed, e.g., send to Gemini or store in a property
    });
  }
  sendToGemini() {
    if (!this.userInput.trim()) return;

    const userMessage = this.userInput;
    this.userInput = '';

    // Add user message to chat UI
    this.messages.push({ user: userMessage, gemini: null, loading: true });

    // Add to conversation history
    this.conversationHistory.push({
      role: 'user',
      parts: [{ text: userMessage }],
    });

    const currentIndex = this.messages.length - 1;

    this.geminiService
      .sendMessage(this.conversationHistory)
      .subscribe((res) => {
        const reply =
          res.candidates[0]?.content?.parts[0]?.text || 'No response.';

        // Update chat UI
        this.messages[currentIndex].gemini = reply;
        this.messages[currentIndex].loading = false;

        // Add AI response to conversation history
        this.conversationHistory.push({
          role: 'model',
          parts: [{ text: reply }],
        });
      });
  }
}
