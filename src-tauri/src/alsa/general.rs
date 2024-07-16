use std::process::Command;
use std::collections::HashMap;

pub fn find_card_index(card_name: &str) -> Result<String, String> {
    let output = Command::new("aplay")
        .arg("-l")
        .output()
        .map_err(|e| format!("Failed to execute aplay: {}", e))?;

    let stdout = String::from_utf8_lossy(&output.stdout);

    for line in stdout.lines() {
        if line.contains(card_name) {
            if let Some(card_index) = line.split_whitespace().nth(1) {
                return Ok(card_index.trim_end_matches(':').to_string());
            }
        }
    }

    Err(format!("Could not find card with name: {}", card_name))
}

pub fn get_soundcard_controls(card_name: &str) -> Result<HashMap<String, Vec<String>>, String> {
    let card_index = find_card_index(card_name)?;
    println!("Found card index {} for {}", card_index, card_name);

    let output = Command::new("amixer")
        .args(&["-c", &card_index])
        .output()
        .map_err(|e| format!("Failed to execute amixer: {}", e))?;

    let stdout = String::from_utf8_lossy(&output.stdout);
    let mut controls = HashMap::new();
    let mut current_control: Option<String> = None;
    let mut current_info: Vec<String> = Vec::new();

    for line in stdout.lines() {
        if line.starts_with("Simple mixer control") {
            // If we were processing a control, save it before starting a new one
            if let Some(name) = current_control.take() {
                controls.insert(name, current_info);
                current_info = Vec::new();
            }

            let parts: Vec<&str> = line.split('\'').collect();
            if parts.len() >= 2 {
                current_control = Some(parts[1].to_string());
                current_info.push(line.to_string());
            }
        } else if !line.trim().is_empty() {
            // Add non-empty lines to the current control's info
            if current_control.is_some() {
                current_info.push(line.to_string());
            }
        }
    }

    // Don't forget to add the last control
    if let Some(name) = current_control {
        controls.insert(name, current_info);
    }

    // // Print the controls
    // println!("Controls:");
    // for (name, info) in &controls {
    //     println!("  {}: ", name);
    //     for line in info {
    //         println!("    {}", line);
    //     }
    // }

    Ok(controls)
}