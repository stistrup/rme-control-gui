use super::general;
use super::volume;

use std::process::Command;

pub fn set_channel_send_level(card_index: &str, channel: &str, destination: &str, level: f32) -> Result<(), String> {

    let clamped_level = (level * 100.0).clamp(0.0, 100.0) as i32;

    // Construct the control name using both channel and destination
    let control_name = format!("{}-{}", channel, destination);

    let output = Command::new("amixer")
        .args(&[
            "-c", &card_index,
            "set", &control_name,
            &format!("{}%", clamped_level),
        ])
        .output()
        .map_err(|e| e.to_string())?;

    if output.status.success() {
        Ok(())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

pub fn get_channel_send_level(card_index: &str, channel: &str, destination: &str) -> Result<f32, String> {

    // Construct the control name using both channel and destination
    let control_name = format!("{}-{}", channel, destination);

    let output = Command::new("amixer")
        .args(&["-c", &card_index, "get", &control_name])
        .output()
        .map_err(|e| e.to_string())?;

    if output.status.success() {
        let stdout = String::from_utf8_lossy(&output.stdout);
        let volume = volume::parse_volume_from_amixer_output(&stdout)?;
        Ok(volume as f32 / 100.0)
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}