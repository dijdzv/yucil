// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{utils::config::AppUrl, WindowUrl};

#[allow(unused)]
#[tauri::command]
async fn get_playlists() -> Vec<String> {
  yucil::youtube::get_youtube_playlists().await.unwrap()
}

fn main() {
  let mut context = tauri::generate_context!();
  let port = 1421;
  let url = format!("http://localhost:{}", port).parse().unwrap();
  let window_url = WindowUrl::External(url);
  context.config_mut().build.dist_dir = AppUrl::Url(window_url.clone());
  context.config_mut().build.dev_path = AppUrl::Url(window_url);

  tauri::Builder::default()
    // .invoke_handler(tauri::generate_handler![get_playlists])
    .plugin(tauri_plugin_localhost::Builder::new(port).build())
    .run(context)
    .expect("error while running yucil");
}
