#![allow(unused_imports)]

use google_youtube3::{chrono, hyper, hyper_rustls, oauth2, Error, FieldMask, YouTube};
use serde_json::json;

pub async fn get_youtube_playlists() -> anyhow::Result<serde_json::Value> {
  let secret = oauth2::read_application_secret("client_secret.json").await?;

  let auth = oauth2::InstalledFlowAuthenticator::builder(
    secret,
    oauth2::InstalledFlowReturnMethod::HTTPRedirect,
  )
  .build()
  .await
  .unwrap();

  let hub = YouTube::new(
    hyper::Client::builder().build(
      hyper_rustls::HttpsConnectorBuilder::new()
        .with_native_roots()
        .https_or_http()
        .enable_http1()
        .enable_http2()
        .build(),
    ),
    auth,
  );

  let result = hub.playlists().list(&vec!["snippet".to_string()]).mine(true).doit().await;

  let mut playlists = result?.1.items.unwrap();
  playlists.sort_by(|a, b| {
    json!(a.snippet)
      .get("title")
      .unwrap()
      .to_string()
      .partial_cmp(&json!(b.snippet).get("title").unwrap().to_string())
      .unwrap()
  });
  let playlists = playlists
    .iter()
    .filter_map(|playlist| {
      json!(playlist.snippet)
        .get("title")?
        .to_string()
        .starts_with("\"music-")
        .then_some(playlist.id.clone()?)
    })
    .collect::<Vec<_>>();

  Ok(json!(playlists))
}

mod tests {
  use super::*;

  #[tokio::test]
  async fn get_youtube_playlists_works() -> anyhow::Result<()> {
    let playlists = get_youtube_playlists().await?;

    let f = std::fs::File::create("playlists.json")?;
    serde_json::to_writer_pretty(f, &playlists)?;

    Ok(())
  }
}
