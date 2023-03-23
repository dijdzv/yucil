declare let tokenClient: any;
declare const google: any;
import { Dispatch, SetStateAction } from 'react';
import { Playlist } from './Dashboard';

export function getPlaylists(setPlaylists: Dispatch<SetStateAction<Playlist[]>>) {
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
        const items = playlistsResponse.result.items;
        items?.sort((a, b) => {
          return a.snippet?.title?.localeCompare(b.snippet?.title || '') || 0;
        });
        const playlists = items?.map((item) => {
          return {
            id: item.id || 'undefined',
            title: item.snippet?.title || 'undefined',
            items: [],
          };
        });
        setPlaylists(playlists || []);
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

export function revokeToken() {
  let cred = gapi.client.getToken();
  if (cred !== null) {
    google.accounts.oauth2.revoke(cred.access_token, () => {
      console.log('Revoked: ' + cred.access_token);
    });
    gapi.client.setToken(null);
  }
}
