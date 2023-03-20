#![allow(unused_imports)]

use google_youtube3::{chrono, hyper, hyper_rustls, oauth2, Error, FieldMask, YouTube};

pub async fn get_youtube_playlists() -> anyhow::Result<String> {
  let secret = oauth2::read_application_secret("client_secret.json").await?;

  let auth = oauth2::InstalledFlowAuthenticator::builder(
    secret,
    oauth2::InstalledFlowReturnMethod::HTTPRedirect,
  )
  .build()
  .await
  .unwrap();

  let mut hub = YouTube::new(
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

  let result = hub
    .videos()
    .list(&vec!["gubergren".into()])
    .video_category_id("Lorem")
    .region_code("gubergren")
    .page_token("eos")
    .on_behalf_of_content_owner("dolor")
    .my_rating("ea")
    .max_width(-55)
    .max_results(13)
    .max_height(-47)
    .locale("duo")
    .add_id("ipsum")
    .hl("sed")
    .chart("ut")
    .doit()
    .await;

  match result {
    Err(e) => match e {
      // The Error enum provides details about what exactly happened.
      // You can also just use its `Debug`, `Display` or `Error` traits
      Error::HttpError(_)
      | Error::Io(_)
      | Error::MissingAPIKey
      | Error::MissingToken(_)
      | Error::Cancelled
      | Error::UploadSizeLimitExceeded(_, _)
      | Error::Failure(_)
      | Error::BadRequest(_)
      | Error::FieldClash(_)
      | Error::JsonDecodeError(_, _) => println!("{}", e),
    },
    Ok(res) => println!("Success: {:?}", res),
  }

  Ok("finished".to_string())
}

mod tests {
  use super::*;

  #[tokio::test]
  async fn get_youtube_playlists_works() -> anyhow::Result<()> {
    get_youtube_playlists().await?;
    Ok(())
  }
}
