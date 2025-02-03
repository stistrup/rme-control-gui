use tauri::AppHandle;
use super::config::{ConfigStorage, InputChannelConfig};

#[tauri::command]
pub fn save_channel_config(
    app_handle: AppHandle,
    control_name: String,
    display_name: String,
    display_name_stereo: String,
    stereo_coupled: bool,
) -> Result<(), String> {
    let storage = ConfigStorage::new(&app_handle).map_err(|e| e.to_string())?;
    let mut config = storage.load_config().map_err(|e| e.to_string())?;

    config.channels.insert(control_name.clone(), InputChannelConfig {
        control_name,
        display_name,
        display_name_stereo,
        stereo_coupled,
    });

    storage.save_config(&config).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn load_channel_config(app_handle: AppHandle, control_name: String) -> Result<Option<InputChannelConfig>, String> {
    let storage = ConfigStorage::new(&app_handle).map_err(|e| e.to_string())?;
    let config = storage.load_config().map_err(|e| e.to_string())?;
    Ok(config.channels.get(&control_name).cloned())
}

#[tauri::command]
pub fn load_all_channels(app_handle: AppHandle) -> Result<Vec<InputChannelConfig>, String> {
    let storage = ConfigStorage::new(&app_handle).map_err(|e| e.to_string())?;
    let config = storage.load_config().map_err(|e| e.to_string())?;
    Ok(config.channels.values().cloned().collect())
}
