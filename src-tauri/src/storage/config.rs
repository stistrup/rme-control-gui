use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;
use serde::{Serialize, Deserialize};
use tauri::AppHandle;

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq)]
pub enum ChannelType {
    Mic,
    Line,
    Adat,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ChannelConfig {
    pub display_name: String,
    pub channel_type: ChannelType,
    pub volume: f32,
    pub gain: f32,
    pub pad: bool,
    pub phantom_power: bool,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct SoundCardConfig {
    pub display_name: String,
    pub channels: HashMap<u32, ChannelConfig>,
    pub active_profile: String,
    pub buffer_size: u32,
}

pub struct ConfigStorage {
    config_path: PathBuf,
}

impl ConfigStorage {
    pub fn new(app_handle: &AppHandle) -> Result<Self, Box<dyn std::error::Error>> {
        let config_dir = app_handle
            .path_resolver()
            .app_config_dir()
            .ok_or("Failed to get app config directory")?;
        fs::create_dir_all(&config_dir)?;
        let config_path = config_dir.join("soundcard_config.json");
        Ok(Self { config_path })
    }

    pub fn save_config(&self, config: &SoundCardConfig) -> Result<(), Box<dyn std::error::Error>> {
        let json = serde_json::to_string_pretty(config)?;
        fs::write(&self.config_path, json)?;
        Ok(())
    }

    pub fn load_config(&self) -> Result<SoundCardConfig, Box<dyn std::error::Error>> {
        if self.config_path.exists() {
            let json = fs::read_to_string(&self.config_path)?;
            let config: SoundCardConfig = serde_json::from_str(&json)?;
            Ok(config)
        } else {
            Ok(SoundCardConfig {
                display_name: String::new(),
                channels: HashMap::new(),
                active_profile: String::new(),
                buffer_size: 256, // Default buffer size
            })
        }
    }
}