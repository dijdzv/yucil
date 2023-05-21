declare let tokenClient: any;
declare const google: any;
import { Dispatch, SetStateAction } from 'react';
import { Playlist, PlaylistItem } from './Dashboard';
import { DraggableLocation } from 'react-beautiful-dnd';

export function getPlaylists(
  setPlaylist: Dispatch<SetStateAction<Playlist | undefined>>,
  setPlaylists: Dispatch<SetStateAction<Playlist[]>>
) {
  tokenClient.callback = (resp: any) => {
    if (resp.error !== undefined) {
      throw resp;
    }
    // GIS has automatically updated gapi.client with the newly issued access token.
    console.log('gapi.client access token: ' + JSON.stringify(gapi.client.getToken()));

    gapi.client.youtube.playlists
      .list({
        part: 'snippet',
        mine: true,
        maxResults: 50,
      })
      .then((playlistsResponse) => {
        const playlists = playlistsResponse.result.items;
        playlists?.sort((a, b) => {
          return a.snippet?.title?.localeCompare(b.snippet?.title || '') || 0;
        });
        const playlistsPromise: Promise<Playlist>[] =
          playlists?.map(async (playlist, playlistIndex) => {
            return gapi.client.youtube.playlistItems
              .list({
                part: 'snippet',
                playlistId: playlist.id,
                maxResults: 50,
              })
              .then((playlistItemListResponse) => {
                // TODO: playlistItemListResponse.result.pageInfo.totalResultsの回数取得するようにする
                // console.log('playlistItemListResponse', playlistItemListResponse);

                const playlistItems = playlistItemListResponse.result.items;

                const newPlaylistItems: PlaylistItem[] =
                  playlistItems?.map((playlistItem) => {
                    return {
                      id: playlistItem.id || 'undefined',
                      title: playlistItem.snippet?.title || 'undefined',
                      thumbnail: playlistItem.snippet?.thumbnails?.default?.url || '',
                      channelId: playlistItem.snippet?.videoOwnerChannelId || 'undefined',
                      channelTitle: playlistItem.snippet?.videoOwnerChannelTitle || 'undefined',
                      position: playlistItem.snippet?.position || 0,
                      resourceId: {
                        kind: playlistItem.snippet?.resourceId?.kind || '',
                        videoId: playlistItem.snippet?.resourceId?.videoId || '',
                      },
                      playlistId: playlist.id || 'undefined',
                    };
                  }) || [];
                return {
                  id: playlist.id || 'undefined',
                  title: playlist.snippet?.title || 'undefined',
                  items: newPlaylistItems,
                  index: 0,
                };
              })
              .catch((err) => {
                console.log(err);
                return {
                  id: 'undefined',
                  title: 'undefined',
                  items: [],
                  index: 0,
                };
              });
          }) || [];
        Promise.all(playlistsPromise).then((newPlaylists) => {
          setPlaylist({ ...newPlaylists[0] });
          setPlaylists(newPlaylists);
        });
      })
      .catch((err) => console.log(err));
  };

  // Conditionally ask users to select the Google Account they'd like to use,
  // and explicitly obtain their consent to fetch their Calendar.
  // NOTE: To request an access token a user gesture is necessary.
  if (gapi.client.getToken() === null) {
    // Prompt the user to select a Google Account and asked for consent to share their data
    // when establishing a new session.
    console.log('Requesting access token');
    tokenClient.requestAccessToken({ prompt: 'consent' });
  } else {
    // Skip display of account chooser and consent dialog for an existing session.
    console.log('skipping access token');
    tokenClient.requestAccessToken({ prompt: '' });
  }
}

// export function revokeToken() {
//   let cred = gapi.client.getToken();
//   if (cred !== null) {
//     google.accounts.oauth2.revoke(cred.access_token, () => {
//       console.log('Revoked: ' + cred.access_token);
//     });
//     gapi.client.setToken(null);
//   }
// }

export function updatePlaylistItems(
  playlists: Playlist[],
  source: DraggableLocation,
  destination: DraggableLocation
): boolean {
  const sourcePlaylist = playlists.find((playlist) => playlist.id === source.droppableId);
  const destinationPlaylist = playlists.find((playlist) => playlist.id === destination.droppableId);
  if (!sourcePlaylist || !destinationPlaylist) return false;
  const sourcePlaylistItem = sourcePlaylist.items[source.index];
  const destinationPlaylistItem = destinationPlaylist.items[destination.index];
  gapi.client.youtube.playlistItems
    .update({
      part: 'snippet',
      resource: {
        id: sourcePlaylistItem.id,
        snippet: {
          playlistId: destinationPlaylistItem.playlistId,
          resourceId: {
            channelId: sourcePlaylistItem.channelId,
            kind: sourcePlaylistItem.resourceId.kind,
            playlistId: sourcePlaylistItem.playlistId,
            videoId: sourcePlaylistItem.resourceId.videoId,
          },
          position: destinationPlaylistItem.position,
        },
      },
    })
    .then((response) => {
      console.log(response);
    })
    .catch((err) => {
      console.log(err);
      return false;
    });
  return true;
}
