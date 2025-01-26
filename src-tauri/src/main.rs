// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod alsa;
mod pipewire;
mod storage;

use tauri::Manager;

pub struct AppState {
    alsa_card_number: String,
    pipewire_card_id: String,
}

impl AppState {
    pub fn new(card_name_alsa: &str, card_name_pipewire: &str, _app_handle: &tauri::AppHandle) -> Result<Self, String> {
        let alsa_card_number = alsa::general::get_card_number_by_name(card_name_alsa)?;
        let pipewire_card_id = pipewire::general::get_card_id_by_name(card_name_pipewire)?;

        Ok(Self {
            alsa_card_number,
            pipewire_card_id,
        })
    }
}

fn main() -> Result<(), Box<dyn std::error::Error>> {
    tauri::Builder::default()
    .plugin(tauri_plugin_shell::init())
    .setup(|app| {
            let app_handle = app.handle(); // Get an immutable AppHandle
            let app_state = AppState::new(&alsa::general::find_babyface_card()?, "RME_Babyface_Pro", app_handle)?;
            // #[cfg(debug_assertions)] // only include this code on debug builds

            app.manage(app_state);

            {
                let window = app.get_webview_window("main").unwrap();
                // window.open_devtools();
                // window.close_devtools();
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            alsa::controller::get_alsa_volume,
            alsa::controller::set_alsa_volume,
            alsa::controller::get_input_gain,
            alsa::controller::set_input_gain,
            alsa::controller::get_line_input_sensitivity,
            alsa::controller::set_line_input_sensitivity,
            alsa::controller::get_pad_state,
            alsa::controller::set_pad_state,
            alsa::controller::get_phantom_power_state,
            alsa::controller::set_phantom_power,
            alsa::controller::get_soundcard_controls,
            pipewire::controller::get_pipewire_active_profile,
            pipewire::controller::set_pipewire_profile,
            pipewire::controller::get_pipewire_profiles,
            pipewire::controller::set_buffer_size,
            storage::controller::save_channel_config,
            storage::controller::load_channel_config,
            storage::controller::load_all_channels
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
    Ok(())
}