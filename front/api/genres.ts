type GenreResponse = string[];
const serverUrl = import.meta.env.VITE_SERVER_URL;

async function getGenres(): Promise<GenreResponse> {
   return fetch(`${serverUrl}/api/genres`).then((res) => res.json());
}

export { getGenres }