use super::config::{ConfigStorage, SoundCardConfig, ChannelConfig, ChannelType};
use tauri::AppHandle;

pub fn save_channel_config(
    app_handle: &AppHandle,
    channel_number: u32,
    display_name: String,
    channel_type: ChannelType,
    volume: f32,
    gain: f32,
    pad: bool,
    phantom_power: bool,
) -> Result<(), String> {
    let storage = ConfigStorage::new(app_handle).map_err(|e| e.to_string())?;
    let mut config = storage.load_config().map_err(|e| e.to_string())?;
    
    config.channels.insert(channel_number, ChannelConfig {
        display_name,
        channel_type,
        volume,
        gain,
        pad,
        phantom_power,
    });
    
    storage.save_config(&config).map_err(|e| e.to_string())
}

pub fn load_channel_config(app_handle: &AppHandle, channel_number: u32) -> Result<Option<ChannelConfig>, String> {
    let storage = ConfigStorage::new(app_handle).map_err(|e| e.to_string())?;
    let config = storage.load_config().map_err(|e| e.to_string())?;
    Ok(config.channels.get(&channel_number).cloned())
}

pub fn save_sound_card_settings(
    app_handle: &AppHandle,
    display_name: String,
    active_profile: String,
    buffer_size: u32,
) -> Result<(), String> {
    let storage = ConfigStorage::new(app_handle).map_err(|e| e.to_string())?;
    let mut config = storage.load_config().map_err(|e| e.to_string())?;
    
    config.display_name = display_name;
    config.active_profile = active_profile;
    config.buffer_size = buffer_size;
    
    storage.save_config(&config).map_err(|e| e.to_string())
}

pub fn load_sound_card_settings(app_handle: &AppHandle) -> Result<(String, String, u32), String> {
    let storage = ConfigStorage::new(app_handle).map_err(|e| e.to_string())?;
    let config = storage.load_config().map_err(|e| e.to_string())?;
    Ok((config.display_name, config.active_profile, config.buffer_size))
}