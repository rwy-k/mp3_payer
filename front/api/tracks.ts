import type { Track } from "@/types/tracks";

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
async function uploadMusicToTrack(id: string, file: File) {
    try {
      // Check file size first (10MB limit)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        throw new Error('File is too large. Maximum size is 10MB.');
      }

      // Check file type
      const allowedMimeTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/x-wav'];
      if (!allowedMimeTypes.includes(file.type)) {
        throw new Error('Invalid file type. Only MP3 and WAV files are allowed.');
      }

      // Create form data
      const formData = new FormData();
      formData.append('file', file);

      // Use XMLHttpRequest to track upload progress
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            try {
              const errorResponse = JSON.parse(xhr.responseText);
              reject(new Error(errorResponse.error || 'Upload failed'));
            } catch (e) {
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Network error occurred during upload'));
        });

        xhr.addEventListener('abort', () => {
          reject(new Error('Upload was aborted'));
        });

        xhr.open('POST', `${serverUrl}/api/tracks/${id}/upload`, true);
        xhr.send(formData);
      });
    } catch (err) {
      console.error('Error uploading music:', err);
    };
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