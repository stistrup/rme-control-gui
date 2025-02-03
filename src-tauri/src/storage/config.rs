use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;
use serde::{Serialize, Deserialize};
use tauri::AppHandle;
use tauri::Manager;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct InputChannelConfig {
    pub control_name: String,
    pub display_name: String,
    #[serde(default)]
    pub display_name_stereo: String,
    pub stereo_coupled: bool,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct SoundCardConfig {
    pub channels: HashMap<String, InputChannelConfig>,
}

pub struct ConfigStorage {
    config_path: PathBuf,
}

impl ConfigStorage {
    pub fn new(app_handle: &AppHandle) -> Result<Self, Box<dyn std::error::Error>> {
        let config_dir = app_handle
            .path()
            .app_config_dir()
            .map_err(|e| format!("Failed to get app config directory: {}", e))?;

        fs::create_dir_all(&config_dir)?;
        let config_path = config_dir.join("input-channels-conf-v1.json");
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
                channels: HashMap::new(),
            })
        }
    }
}