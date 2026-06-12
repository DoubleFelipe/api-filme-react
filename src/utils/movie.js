export const POSTER_FALLBACK =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600'%3E%3Crect width='400' height='600' fill='%2311161f'/%3E%3Cpath d='M96 218h208v164H96z' fill='%23212a38'/%3E%3Ccircle cx='156' cy='278' r='34' fill='%23354355'/%3E%3Cpath d='M118 356l55-58 39 42 28-30 48 46z' fill='%23445468'/%3E%3Ctext x='200' y='446' text-anchor='middle' fill='%23b9c1d4' font-family='Arial' font-size='28'%3ESem imagem%3C/text%3E%3C/svg%3E";

export const PROFILE_FALLBACK =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%2311161f'/%3E%3Ccircle cx='150' cy='112' r='54' fill='%23354355'/%3E%3Cpath d='M62 270c14-64 55-96 88-96s74 32 88 96' fill='%23212a38'/%3E%3C/svg%3E";

export function imageUrl(path, size = "w500") {
  return path ? `https://image.tmdb.org/t/p/${size}${path}` : null;
}

export function formatDate(date) {
  if (!date) {
    return "Data indisponível";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

export function formatRuntime(minutes) {
  if (!minutes) {
    return "Duração indisponível";
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (!hours) {
    return `${remainingMinutes}min`;
  }

  return `${hours}h ${remainingMinutes}min`;
}

export function formatRating(rating) {
  return rating ? rating.toFixed(1).replace(".", ",") : "S/N";
}
