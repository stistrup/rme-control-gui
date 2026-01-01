use tauri::State;
use super::{buffer_size, profile};

#[tauri::command]
pub fn get_clock_quantum(_state: State<'_, super::super::AppState>) -> Result<u32, String> {
    buffer_size::get_clock_quantum()
}

#[tauri::command]
pub fn set_clock_quantum(_state: State<'_, super::super::AppState>, quantum: u32) -> Result<(), String> {
    buffer_size::set_clock_quantum(quantum)
}

#[tauri::command]
pub fn get_pipewire_active_profile(state: State<'_, super::super::AppState>) -> Result<String, String> {
    let card_id = &state.pipewire_card_id;
    profile::get_active_profile(&card_id)
}

#[tauri::command]
pub fn set_pipewire_profile(state: State<'_, super::super::AppState>, profile: String) -> Result<(), String> {
    let card_id = &state.pipewire_card_id;
    profile::set_profile(&card_id, &profile)
}

#[tauri::command]
pub fn get_pipewire_profiles(state: State<'_, super::super::AppState>) -> Result<Vec<String>, String> {
    let card_id = &state.pipewire_card_id;
    profile::get_profiles(&card_id)
}