use super::general;
use std::process::Command;

pub fn set_volume(card_index: &str, control_name: &str, volume: i32) -> Result<(), String> {

    let output = Command::new("amixer")
        .args(&[
            "-c",
            card_index,
            "set",
            control_name,
            &format!("{}", volume),
        ])
        .output()
        .map_err(|e| e.to_string())?;

    if output.status.success() {
        Ok(())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

pub fn get_volume(card_index: &str, control_name: &str) -> Result<i32, String> {

    let output = Command::new("amixer")
        .args(&["-c", &card_index, "get", control_name])
        .output()
        .map_err(|e| e.to_string())?;

    if output.status.success() {
        let stdout = String::from_utf8_lossy(&output.stdout);
        let volume = general::parse_value_from_amixer_output(&stdout)?;
        Ok(volume)
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}