// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod alsa {
    pub mod general;
    pub mod sends;
    pub mod switches;
    pub mod volume;
}

mod pipewire {
    pub mod buffer_size;
    pub mod general;
    pub mod profile;
    pub mod volume;
}

use std::collections::HashMap;
use tauri::Manager;

#[tauri::command]
fn find_sound_card_number(card_name: String) -> Result<String, String> {
    alsa::general::find_card_index(&card_name)
}

#[tauri::command]
fn set_alsa_volume(card_name: String, control_name: String, volume: i32) -> Result<(), String> {
    alsa::volume::set_volume(&card_name, &control_name, volume)
}

#[tauri::command]
fn get_alsa_volume(card_name: String, control_name: String) -> Result<i32, String> {
    alsa::volume::get_volume(&card_name, &control_name)
}

#[tauri::command]
fn set_channel_send_level(card_name: &str, channel: &str, destination: &str, level: f32) -> Result<(), String> {
    alsa::sends::set_channel_send_level(card_name, channel, destination, level)
}

#[tauri::command]
fn get_channel_send_level(card_name: &str, channel: &str, destination: &str) -> Result<f32, String> {
    alsa::sends::get_channel_send_level(card_name, channel, destination)
}

#[tauri::command]
fn set_phantom_power(card_name: String, mic_alsa_name: String, new_state: bool) -> Result<(), String> {
    alsa::switches::set_phantom_power(&card_name, &mic_alsa_name, new_state)
}
#[tauri::command]
fn get_phantom_power_state(card_name: String, mic_alsa_name: String) -> Result<bool, String> {
    alsa::switches::get_phantom_power_state(&card_name, &mic_alsa_name)
}

#[tauri::command]
fn get_line_input_sensitivity(card_name: String, line_input_name: String) -> Result<String, String> {
    alsa::switches::get_line_input_sensitivity(&card_name, &line_input_name)
}

#[tauri::command]
fn set_line_input_sensitivity(card_name: String, line_input_name: String, sensitivity: String) -> Result<(), String> {
    alsa::switches::set_line_input_sensitivity(&card_name, &line_input_name, &sensitivity)
}

#[tauri::command]
fn get_soundcard_controls(card_name: String) -> Result<HashMap<String, Vec<String>>, String> {
    alsa::general::get_soundcard_controls(&card_name)
}

#[tauri::command]
fn get_pipewire_volume(port_name: String) -> Result<f32, String> {
    pipewire::volume::get_volume(&port_name)
}

#[tauri::command]
fn set_pipewire_volume(port_name: String, gain: f32) -> Result<(), String> {
    pipewire::volume::set_volume(&port_name, gain)
}

#[tauri::command]
fn get_pipewire_active_profile(card_name: String) -> Result<String, String> {
    let card_id = pipewire::general::get_card_id_by_name(&card_name)?;
    pipewire::profile::get_active_profile(&card_id)
}

#[tauri::command]
fn set_pipewire_profile(card_name: String, profile: String) -> Result<(), String> {
    let card_id = pipewire::general::get_card_id_by_name(&card_name)?;
    pipewire::profile::set_profile(&card_id, &profile)
}

#[tauri::command]
fn set_buffer_size(buffer_size: u32) -> Result<(), String> {
    pipewire::buffer_size::set_buffer_size(buffer_size)
}

#[tauri::command]
fn get_pipewire_profiles(card_name: String) -> Result<Vec<String>, String> {
    let card_id = pipewire::general::get_card_id_by_name(&card_name)?;
    pipewire::profile::get_profiles(&card_id)
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
            get_alsa_volume,
            get_channel_send_level,
            get_line_input_sensitivity,
            get_phantom_power_state,
            get_pipewire_active_profile,
            get_pipewire_volume,
            get_pipewire_profiles,
            get_soundcard_controls,
            set_buffer_size,
            set_channel_send_level,
            set_line_input_sensitivity,
            set_phantom_power,
            set_pipewire_volume,
            set_pipewire_profile,
            set_alsa_volume,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}