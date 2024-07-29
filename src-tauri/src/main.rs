// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod alsa;
mod pipewire;

use alsa::AlsaController;
use pipewire::PipeWireController;
use tauri::Manager;

struct AppState {
    alsa: AlsaController,
    pipewire: PipeWireController,
}

fn main() {
    let app_state = AppState {
        alsa: AlsaController::new("Babyface Pro".to_string()),
        pipewire: PipeWireController::new(),
    };

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
        .manage(app_state)
        .invoke_handler(tauri::generate_handler![
            alsa::controller::find_sound_card_number,
            alsa::controller::get_alsa_volume,
            alsa::controller::set_alsa_volume,
            alsa::controller::get_channel_send_level,
            alsa::controller::set_channel_send_level,
            alsa::controller::get_line_input_sensitivity,
            alsa::controller::set_line_input_sensitivity,
            alsa::controller::get_phantom_power_state,
            alsa::controller::set_phantom_power,
            alsa::controller::get_soundcard_controls,
            pipewire::controller::get_pipewire_active_profile,
            pipewire::controller::set_pipewire_profile,
            pipewire::controller::get_pipewire_profiles,
            pipewire::controller::set_buffer_size,
            pipewire::controller::get_pipewire_volume,
            pipewire::controller::set_pipewire_volume
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}