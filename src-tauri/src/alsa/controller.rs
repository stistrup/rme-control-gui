use std::collections::HashMap;
use tauri::State;
use super::{general, sends, switches, volume};

pub struct AlsaController {
    card_name: String,
}

impl AlsaController {
    pub fn new(card_name: String) -> Self {
        Self { card_name }
    }
}

#[tauri::command]
pub fn get_soundcard_controls(state: State<'_, super::super::AppState>) -> Result<HashMap<String, Vec<String>>, String> {
    general::get_soundcard_controls(&state.alsa.card_name)
}

#[tauri::command]
pub fn set_channel_send_level(state: State<'_, super::super::AppState>, channel: String, destination: String, level: f32) -> Result<(), String> {
    sends::set_channel_send_level(&state.alsa.card_name, &channel, &destination, level)
}

#[tauri::command]
pub fn get_channel_send_level(state: State<'_, super::super::AppState>, channel: String, destination: String) -> Result<f32, String> {
    sends::get_channel_send_level(&state.alsa.card_name, &channel, &destination)
}

#[tauri::command]
pub fn set_phantom_power(state: State<'_, super::super::AppState>, mic: String, new_state: bool) -> Result<(), String> {
    switches::set_phantom_power(&state.alsa.card_name, &mic, new_state)
}

#[tauri::command]
pub fn get_phantom_power_state(state: State<'_, super::super::AppState>, mic_name: String) -> Result<bool, String> {
    switches::get_phantom_power_state(&state.alsa.card_name, &mic_name)
}

#[tauri::command]
pub fn get_line_input_sensitivity(state: State<'_, super::super::AppState>, line_input_name: String) -> Result<String, String> {
    switches::get_line_input_sensitivity(&state.alsa.card_name, &line_input_name)
}

#[tauri::command]
pub fn set_line_input_sensitivity(state: State<'_, super::super::AppState>, line_input_name: String, sensitivity: String) -> Result<(), String> {
    switches::set_line_input_sensitivity(&state.alsa.card_name, &line_input_name, &sensitivity)
}

#[tauri::command]
pub fn set_alsa_volume(state: State<'_, super::super::AppState>, control_name: String, volume: i32) -> Result<(), String> {
    volume::set_volume(&state.alsa.card_name, &control_name, volume)
}

#[tauri::command]
pub fn get_alsa_volume(state: State<'_, super::super::AppState>, control_name: String) -> Result<i32, String> {
    volume::get_volume(&state.alsa.card_name, &control_name)
}

#[tauri::command]
pub fn find_sound_card_number(_state: State<'_, super::super::AppState>, card_name: String) -> Result<String, String> {
    general::find_card_index(&card_name)
}