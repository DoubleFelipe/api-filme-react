import axios from "axios";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const requestCache = new Map();

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const tmdbClient = axios.create({
  baseURL: "https://api.themoviedb.org/3",
  timeout: 10000,
});

function assertApiKey() {
  if (!API_KEY) {
    throw new ApiError(
      "Configure a variável VITE_TMDB_API_KEY no arquivo .env para carregar os filmes.",
      401,
    );
  }
}

function createCacheKey(path, params) {
  return `${path}:${JSON.stringify(params)}`;
}

async function request(path, params = {}, options = {}) {
  assertApiKey();

  const requestParams = {
    api_key: API_KEY,
    language: "pt-BR",
    ...params,
  };
  const cacheKey = createCacheKey(path, requestParams);

  if (options.cache !== false && requestCache.has(cacheKey)) {
    return requestCache.get(cacheKey);
  }

  try {
    const promise = tmdbClient
      .get(path, { params: requestParams })
      .then((response) => response.data);

    if (options.cache !== false) {
      requestCache.set(cacheKey, promise);
    }

    return await promise;
  } catch (error) {
    if (options.cache !== false) {
      requestCache.delete(cacheKey);
    }

    if (axios.isAxiosError(error)) {
      const status = error.response?.status;

      if (status === 401) {
        throw new ApiError("A chave do TMDB não é válida. Confira o arquivo .env.", status);
      }

      if (error.code === "ECONNABORTED") {
        throw new ApiError("A API demorou para responder. Tente novamente em instantes.", 408);
      }

      throw new ApiError(
        "Não foi possível carregar os dados do TMDB agora. Tente novamente.",
        status,
      );
    }

    throw new ApiError("Ocorreu um erro inesperado ao carregar os filmes.");
  }
}

function asText(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function asNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

export function normalizeMovieSummary(movie) {
  return {
    id: movie.id,
    title: asText(movie.title || movie.name, "Título indisponível"),
    overview: asText(movie.overview),
    posterPath: asText(movie.poster_path),
    backdropPath: asText(movie.backdrop_path),
    releaseDate: asText(movie.release_date),
    voteAverage: asNumber(movie.vote_average),
    voteCount: asNumber(movie.vote_count),
  };
}

function validateListResponse(data) {
  if (!data || !Array.isArray(data.results)) {
    throw new ApiError("A resposta do TMDB veio em um formato inesperado.");
  }

  return {
    page: asNumber(data.page, 1),
    totalPages: asNumber(data.total_pages, 1),
    totalResults: asNumber(data.total_results, 0),
    results: data.results.filter((movie) => movie?.id).map(normalizeMovieSummary),
  };
}

function normalizeMovieDetails(movie) {
  if (!movie?.id) {
    throw new ApiError("Filme não encontrado.");
  }

  const videos = asArray(movie.videos?.results);
  const trailer =
    videos.find(
      (video) =>
        video.site === "YouTube" &&
        video.type === "Trailer" &&
        (video.iso_639_1 === "pt" || video.official),
    ) ||
    videos.find((video) => video.site === "YouTube" && video.type === "Trailer") ||
    videos.find((video) => video.site === "YouTube");

  return {
    ...normalizeMovieSummary(movie),
    genres: asArray(movie.genres).map((genre) => ({
      id: genre.id,
      name: asText(genre.name),
    })),
    runtime: asNumber(movie.runtime),
    tagline: asText(movie.tagline),
    cast: asArray(movie.credits?.cast)
      .filter((person) => person?.id)
      .slice(0, 10)
      .map((person) => ({
        id: person.id,
        name: asText(person.name, "Nome indisponível"),
        character: asText(person.character),
        profilePath: asText(person.profile_path),
      })),
    trailerKey: asText(trailer?.key),
    similar: validateListResponse(movie.similar || { results: [] }).results.slice(0, 12),
  };
}

export async function getPopularMovies(page = 1) {
  return validateListResponse(await request("/movie/popular", { page }));
}

export async function getTopRatedMovies(page = 1) {
  return validateListResponse(await request("/movie/top_rated", { page }));
}

export async function getNowPlayingMovies(page = 1) {
  return validateListResponse(await request("/movie/now_playing", { page }));
}

export async function getUpcomingMovies(page = 1) {
  return validateListResponse(await request("/movie/upcoming", { page }));
}

export async function searchMovies(query, page = 1) {
  const normalizedQuery = asText(query);

  if (!normalizedQuery) {
    return { page: 1, totalPages: 1, totalResults: 0, results: [] };
  }

  return validateListResponse(
    await request("/search/movie", {
      query: normalizedQuery,
      page,
      include_adult: false,
    }),
  );
}

export async function getMovieDetails(id) {
  const movieId = Number(id);

  if (!Number.isInteger(movieId) || movieId <= 0) {
    throw new ApiError("Identificador de filme inválido.", 400);
  }

  return normalizeMovieDetails(
    await request(`/movie/${movieId}`, {
      append_to_response: "credits,videos,similar",
    }),
  );
}
