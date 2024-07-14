// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod alsa_control;
mod pipewire_control;
mod pipewire_profile;

use serde::Serialize;
use std::collections::HashMap;
use tauri::Manager;

#[tauri::command]
fn find_sound_card_number(sound_card_name: String) -> Result<u32, String> {
    alsa_control::find_sound_card_number(&sound_card_name)
}

#[tauri::command]
fn change_buffer_size(value: u32) -> Result<(), String> {
    alsa_control::change_buffer_size(value)
}

#[tauri::command]
fn set_volume(control_name: String, volume: i32) -> Result<(), String> {
    alsa_control::set_volume(&control_name, volume)
}

#[derive(Serialize)]
struct InitialStates {
    headphones_volume: i32,
    monitors_volume: i32,
}

#[tauri::command]
fn get_initial_states() -> Result<InitialStates, String> {
    let (headphones_volume, monitors_volume) = alsa_control::get_initial_states()?;
    Ok(InitialStates {
        headphones_volume,
        monitors_volume,
    })
}

#[tauri::command]
fn get_soundcard_controls(card_name: String) -> Result<HashMap<String, Vec<String>>, String> {
    alsa_control::get_soundcard_controls(&card_name)
}

#[tauri::command]
fn get_pipewire_gain(port_name: String) -> Result<f32, String> {
    pipewire_control::get_gain(&port_name)
}

#[tauri::command]
fn set_pipewire_gain(port_name: String, gain: f32) -> Result<(), String> {
    pipewire_control::set_gain(&port_name, gain)
}

#[tauri::command]
fn get_pipewire_active_profile(card_name: String) -> Result<String, String> {
    let card_id = pipewire_profile::get_card_id(&card_name)?;
    pipewire_profile::get_active_profile(&card_id)
}

#[tauri::command]
fn set_pipewire_profile(card_name: String, profile: String) -> Result<(), String> {
    let card_id = pipewire_profile::get_card_id(&card_name)?;
    pipewire_profile::set_profile(&card_id, &profile)
}

#[tauri::command]
fn get_pipewire_profiles(card_name: String) -> Result<Vec<String>, String> {
    let card_id = pipewire_profile::get_card_id(&card_name)?;
    pipewire_profile::get_profiles(&card_id)
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
            find_sound_card_number,
            change_buffer_size,
            set_volume,
            get_initial_states,
            get_soundcard_controls,
            get_pipewire_gain,
            get_pipewire_active_profile,
            get_pipewire_profiles,
            set_pipewire_gain,
            set_pipewire_profile,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}