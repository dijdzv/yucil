import { useState, useEffect } from 'react';
import axios from 'axios';
import { useGoogleLogin } from '@react-oauth/google';

interface Playlist {
  id: string;
  title: string;
}

interface PlaylistItem {
  id: string;
  title: string;
}

export function PlaylistComponent() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [playlistItems, setPlaylistItems] = useState<PlaylistItem[]>([]);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    setTimeout(() => {
      login();
    }, 100);
  }, []);

  useEffect(() => {
    async function fetchPlaylists() {
      if (!accessToken) return;
      const { data } = (await axios.get('https://www.googleapis.com/youtube/v3/playlists', {
        params: {
          part: 'snippet',
          mine: true,
          access_token: accessToken,
          maxResults: 50,
        },
      })) as { data: gapi.client.youtube.PlaylistListResponse };
      const playlists = data.items?.map((item: any) => ({
        id: item.id,
        title: item.snippet.title,
      }));
      setPlaylists(playlists || []);
    }
    fetchPlaylists();
  }, [accessToken]);

  useEffect(() => {
    async function fetchPlaylistItems() {
      if (playlists.length === 0) return;
      const playlistIds = playlists.map((playlist) => playlist.id);
      const playlistItems: PlaylistItem[] = [];
      for (const playlistId of playlistIds) {
        let nextPageToken: string | undefined = undefined;
        while (true) {
          const { data } = (await axios.get('https://www.googleapis.com/youtube/v3/playlistItems', {
            params: {
              part: 'snippet',
              playlistId,
              access_token: accessToken,
              maxResults: 50,
              pageToken: nextPageToken,
            },
          })) as { data: gapi.client.youtube.PlaylistItemListResponse };
          const items = data.items?.map((item: any) => ({
            id: item.id,
            title: item.snippet.title,
          }));
          playlistItems.push(...(items || []));
          nextPageToken = data.nextPageToken;
          if (!nextPageToken) break;
        }
      }
      setPlaylistItems(playlistItems);
    }
    fetchPlaylistItems();
  }, [playlists, accessToken]);

  const login = useGoogleLogin({
    onSuccess: (codeResponse) => setAccessToken(codeResponse.access_token),
    onError: (error) => console.error(error),
    onNonOAuthError: (error) => console.error(error),
    flow: 'implicit',
    scope: 'https://www.googleapis.com/auth/youtube',
  });

  return (
    <div>
      {accessToken ? (
        <div>
          <h1>My Playlists</h1>
          <ul>
            {playlists.map((playlist) => (
              <li key={playlist.id}>
                {playlist.title}
                <ul>
                  {playlistItems
                    .filter((item) => item.id.startsWith(playlist.id))
                    .map((item) => (
                      <li key={item.id}>{item.title}</li>
                    ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p>Not logged in</p>
      )}
    </div>
  );
}
