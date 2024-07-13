// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod audio_control;

use tauri::Manager;
use serde::{Deserialize, Serialize};

#[tauri::command]
fn initialize_sound_card(sound_card_name: String) -> Result<u32, String> {
    audio_control::initialize_sound_card(&sound_card_name)
}

#[tauri::command]
fn change_buffer_size(value: u32) -> Result<(), String> {
    audio_control::change_buffer_size(value)
}

#[tauri::command]
fn set_volume(control_name: String, volume: i32) -> Result<(), String> {
    audio_control::set_volume(&control_name, volume)
}

#[derive(Serialize)]
struct InitialStates {
    headphones_volume: i32,
    monitors_volume: i32,
}

#[tauri::command]
fn get_initial_states() -> Result<InitialStates, String> {
    let (headphones_volume, monitors_volume) = audio_control::get_initial_states()?;
    Ok(InitialStates {
        headphones_volume,
        monitors_volume,
    })
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            #[cfg(debug_assertions)] // only include this code on debug builds
            {
              let window = app.get_webview_window("main").unwrap();
              window.open_devtools();
              window.close_devtools();
            }
            Ok(())
          })
        .invoke_handler(tauri::generate_handler![
            initialize_sound_card,
            change_buffer_size,
            set_volume,
            get_initial_states,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
