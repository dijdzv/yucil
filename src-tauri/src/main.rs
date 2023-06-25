// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{utils::config::AppUrl, WindowUrl};

fn main() {
  let port = portpicker::pick_unused_port().expect("failed to find unused port");

  let mut context = tauri::generate_context!();
  let url = format!("http://localhost:{}", port).parse().unwrap();
  let window_url = WindowUrl::External(url);
  context.config_mut().build.dist_dir = AppUrl::Url(window_url);

  tauri::Builder::default()
    .plugin(tauri_plugin_localhost::Builder::new(port).build())
    .run(context)
    .expect("error while running yucil");
}
