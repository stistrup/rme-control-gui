use crate::AppState;
use std::collections::HashMap;
use tauri::State;
use super::{general, input_gain, switches, volume};

#[tauri::command]
pub fn get_soundcard_controls(state: State<AppState>) -> Result<HashMap<String, Vec<String>>, String> {
    let card_number = &state.alsa_card_number;
    general::get_soundcard_controls(&card_number)
}

#[tauri::command]
pub fn get_input_gain(state: State<AppState>, control_name: String) -> Result<i32, String> {
    let card_number = &state.alsa_card_number;
    input_gain::get_input_gain(&card_number, &control_name)
}

#[tauri::command]
pub fn set_input_gain(state: State<AppState>, control_name: String, gain: i32) -> Result<(), String> {
    let card_number = &state.alsa_card_number;
    input_gain::set_input_gain(&card_number, &control_name, gain)
}

#[tauri::command]
pub fn get_pad_state(state: State<AppState>, control_name: String) -> Result<bool, String> {
    let card_number = &state.alsa_card_number;
    switches::get_pad_state(&card_number, &control_name)
}

#[tauri::command]
pub fn set_pad_state(state: State<AppState>, control_name: String, new_state: bool) -> Result<(), String> {
    let card_number = &state.alsa_card_number;
    switches::set_pad_state(&card_number, &control_name, new_state)
}

#[tauri::command]
pub fn get_phantom_power_state(state: State<AppState>, control_name: String) -> Result<bool, String> {
    let card_number = &state.alsa_card_number;
    switches::get_phantom_power_state(&card_number, &control_name)
}

#[tauri::command]
pub fn set_phantom_power(state: State<AppState>, control_name: String, new_state: bool) -> Result<(), String> {
    let card_number = &state.alsa_card_number;
    switches::set_phantom_power(&card_number, &control_name, new_state)
}

#[tauri::command]
pub fn get_line_input_sensitivity(state: State<AppState>, line_input_name: String) -> Result<String, String> {
    let card_number = &state.alsa_card_number;
    switches::get_line_input_sensitivity(&card_number, &line_input_name)
}

#[tauri::command]
pub fn set_line_input_sensitivity(state: State<AppState>, line_input_name: String, sensitivity: String) -> Result<(), String> {
    let card_number = &state.alsa_card_number;
    switches::set_line_input_sensitivity(&card_number, &line_input_name, &sensitivity)
}

#[tauri::command]
pub fn get_alsa_volume(state: State<AppState>, control_name: String) -> Result<i32, String> {
    let card_number = &state.alsa_card_number;
    volume::get_volume(&card_number, &control_name)
}

#[tauri::command]
pub fn set_alsa_volume(state: State<AppState>, control_name: String, volume: i32) -> Result<(), String> {
    let card_number = &state.alsa_card_number;
    volume::set_volume(&card_number, &control_name, volume)
}