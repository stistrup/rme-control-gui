use super::general;
use std::process::Command;

pub fn set_routing_volume(card_index: &str, source: &str, destination: &str, level: f32) -> Result<(), String> {

    // Construct the control name using both channel and destination
    let control_name = format!("{}-{}", source, destination);

    let output = Command::new("amixer")
        .args(&[
            "-c", &card_index,
            "set", &control_name,
            &format!("{}", level),
        ])
        .output()
        .map_err(|e| e.to_string())?;

    if output.status.success() {
        Ok(())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

pub fn get_routing_volume(card_index: &str, source: &str, destination: &str) -> Result<i32, String> {

    // Construct the control name using both channel and destination
    let control_name = format!("{}-{}", source, destination);

    let output = Command::new("amixer")
        .args(&["-c", &card_index, "get", &control_name])
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