use regex::Regex;
use std::process::Command;
use super::general;

pub fn set_volume(sound_card_name: &str, control_name: &str, volume: i32) -> Result<(), String> {
    let card_index = general::find_card_index(sound_card_name)?;

    // Clamp volume between 0 and 100
    let clamped_volume = volume.clamp(0, 100);

    let output = Command::new("amixer")
        .args(&[
            "-c",
            &card_index,
            "set",
            control_name,
            &format!("{}%", clamped_volume),
        ])
        .output()
        .map_err(|e| e.to_string())?;

    if output.status.success() {
        Ok(())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

pub fn get_volume(sound_card_name: &str, control_name: &str) -> Result<i32, String> {
    let card_index = general::find_card_index(sound_card_name)?;

    let output = Command::new("amixer")
        .args(&["-c", &card_index, "get", control_name])
        .output()
        .map_err(|e| e.to_string())?;

    if output.status.success() {
        let stdout = String::from_utf8_lossy(&output.stdout);
        parse_volume_from_amixer_output(&stdout)
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

pub fn parse_volume_from_amixer_output(output: &str) -> Result<i32, String> {
    let re = Regex::new(r"(\d+)%").unwrap();
    if let Some(caps) = re.captures(output) {
        caps[1].parse::<i32>().map_err(|e| e.to_string())
    } else {
        Err("Could not parse volume from amixer output".to_string())
    }
}