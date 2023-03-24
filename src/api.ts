declare let tokenClient: any;
declare const google: any;
import { Dispatch, SetStateAction } from 'react';
import { Playlist, PlaylistItem } from './Dashboard';

export async function getPlaylists(setPlaylists: Dispatch<SetStateAction<Playlist[]>>) {
  console.log('getPlaylists');
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
      })
      .then((playlistsResponse) => {
        const playlists = playlistsResponse.result.items;
        playlists?.sort((a, b) => {
          return a.snippet?.title?.localeCompare(b.snippet?.title || '') || 0;
        });
        const playlistsPromise: Promise<Playlist>[] =
          playlists?.map(async (playlist) => {
            return gapi.client.youtube.playlistItems
              .list({
                part: 'snippet',
                playlistId: playlist.id,
              })
              .then((playlistItemListResponse) => {
                const playlistItems = playlistItemListResponse.result.items;
                const newPlaylistItems: PlaylistItem[] =
                  playlistItems?.map((playlistItem, index) => {
                    return {
                      id: playlistItem.id || 'undefined',
                      title: playlistItem.snippet?.title || 'undefined',
                    };
                  }) || [];
                return {
                  id: playlist.id || 'undefined',
                  title: playlist.snippet?.title || 'undefined',
                  items: newPlaylistItems,
                };
              })
              .catch((err) => {
                console.log(err);
                return {
                  id: 'undefined',
                  title: 'undefined',
                  items: [],
                };
              });
          }) || [];

        Promise.all(playlistsPromise).then((newPlaylists) => {
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
    tokenClient.requestAccessToken({ prompt: 'consent' });
  } else {
    // Skip display of account chooser and consent dialog for an existing session.
    tokenClient.requestAccessToken({ prompt: '' });
  }
}

// export function getPlaylistItems(playlists: Playlist[], setPlaylists: Dispatch<SetStateAction<Playlist[]>>) {
//   console.log('getPlaylistItems');
//   tokenClient.callback = (resp: any) => {
//     if (resp.error !== undefined) {
//       throw resp;
//     }
//     // GIS has automatically updated gapi.client with the newly issued access token.
//     console.log('gapi.client access token: ' + JSON.stringify(gapi.client.getToken()));

//     gapi.client.youtube.playlistItems
//       .list({
//         part: 'snippet',
//         playlistId: playlist.id,
//       })
//       .then((playlistItemListResponse) => {
//         const items = playlistItemListResponse.result.items;
//         const playlists = items?.map((item) => {
//           return {
//             id: item.id || 'undefined',
//             title: item.snippet?.title || 'undefined',
//             items: [],
//           };
//         });
//         setPlaylists(playlists || []);
//       })
//       .catch((err) => console.log(err));
//   };

//   // Conditionally ask users to select the Google Account they'd like to use,
//   // and explicitly obtain their consent to fetch their Calendar.
//   // NOTE: To request an access token a user gesture is necessary.
//   if (gapi.client.getToken() === null) {
//     // Prompt the user to select a Google Account and asked for consent to share their data
//     // when establishing a new session.
//     tokenClient.requestAccessToken({ prompt: 'consent' });
//   } else {
//     // Skip display of account chooser and consent dialog for an existing session.
//     tokenClient.requestAccessToken({ prompt: '' });
//   }
// }

export function revokeToken() {
  let cred = gapi.client.getToken();
  if (cred !== null) {
    google.accounts.oauth2.revoke(cred.access_token, () => {
      console.log('Revoked: ' + cred.access_token);
    });
    gapi.client.setToken(null);
  }
}
