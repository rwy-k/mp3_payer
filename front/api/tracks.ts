import type { Track } from "~/types/tracks";

const serverUrl = import.meta.env.VITE_SERVER_URL;

interface TracksResponse {
    data: Track[],
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }
}
async function getAllTracks(): Promise<Track[]> {
    let response: TracksResponse;
    let currentPage = 1;
    let tracks: Track[] = [];
    do {
        response = await fetch(`${serverUrl}/api/tracks?page=${currentPage}`).then((res) => res.json());
        if (!response) {
            throw new Error('Failed to fetch tracks');
        }

        tracks = [...tracks, ...response.data];
        currentPage++;
    } while (currentPage < response.meta.totalPages);
  return tracks;
}

async function getTrackById(id: string): Promise<Track[]> {
  return fetch(`${serverUrl}/api/tracks/${id}`).then((res) => res.json());
}

async function addTrack(track: Track): Promise<Track> {
  return fetch(`${serverUrl}/api/tracks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(track),
  }).then((res) => res.json());
}
async function updateTrack(track: Track): Promise<Track> {
  return fetch(`${serverUrl}/api/tracks/${track.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(track),
  }).then((res) => res.json());
}
async function deleteTrack(id: string): Promise<void> {
    return fetch(`${serverUrl}/api/tracks/${id}`, {
        method: 'DELETE',
    }).then((res) => {
        if (!res.ok) {
            throw new Error('Failed to delete track');
        }
    });
}
async function uploadMusicToTrack(id: string, file: File): Promise<Track> {
    const formData = new FormData();
    formData.append('file', file);

    return fetch(`${serverUrl}/api/tracks/${id}/upload`, { 
        method: 'POST',
        body: formData,
    }).then((res) => res.json());
}
async function deleteMusicFromTrack(id: string): Promise<void> {
    return fetch(`${serverUrl}/api/tracks/${id}/file`, {
        method: 'DELETE',
    }).then((res) => {
        if (!res.ok) {
            throw new Error('Failed to delete music from track');
        }
    });
}

export { getAllTracks, getTrackById, addTrack, updateTrack, deleteTrack, uploadMusicToTrack, deleteMusicFromTrack };