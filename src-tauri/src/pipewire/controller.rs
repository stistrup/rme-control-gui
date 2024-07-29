use super::{buffer_size, general, profile, volume};
use tauri::State;

pub struct PipeWireController;

impl PipeWireController {
    pub fn new() -> Self {
        Self
    }
}

#[tauri::command]
pub fn set_buffer_size(_state: State<'_, super::super::AppState>, buffer_size: u32) -> Result<(), String> {
    buffer_size::set_buffer_size(buffer_size)
}

#[tauri::command]
pub fn get_pipewire_active_profile(_state: State<'_, super::super::AppState>, card_name: String) -> Result<String, String> {
    let card_id = general::get_card_id_by_name(&card_name)?;
    profile::get_active_profile(&card_id)
}

#[tauri::command]
pub fn set_pipewire_profile(_state: State<'_, super::super::AppState>, card_name: String, profile: String) -> Result<(), String> {
    let card_id = general::get_card_id_by_name(&card_name)?;
    profile::set_profile(&card_id, &profile)
}

#[tauri::command]
pub fn get_pipewire_profiles(_state: State<'_, super::super::AppState>, card_name: String) -> Result<Vec<String>, String> {
    let card_id = general::get_card_id_by_name(&card_name)?;
    profile::get_profiles(&card_id)
}

#[tauri::command]
pub fn get_pipewire_volume(_state: State<'_, super::super::AppState>, port_name: String) -> Result<f32, String> {
    volume::get_volume(&port_name)
}

#[tauri::command]
pub fn set_pipewire_volume(_state: State<'_, super::super::AppState>, port_name: String, gain: f32) -> Result<(), String> {
    volume::set_volume(&port_name, gain)
}