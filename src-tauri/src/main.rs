// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#[tauri::command]
async fn get_playlists() -> Vec<String> {
  yucil::youtube::get_youtube_playlists().await.unwrap()
}

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![get_playlists])
    .run(tauri::generate_context!())
    .expect("error while running yucil");
}
