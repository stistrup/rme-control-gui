use std::process::Command;

pub fn set_phantom_power(card_index: &str, mic: &str, new_state: bool) -> Result<(), String> {
    let state = if new_state { "on" } else { "off" };
    
    let output = Command::new("amixer")
        .args(&["-c", &card_index, "set", mic, state])
        .output()
        .map_err(|e| e.to_string())?;
    
    if output.status.success() {
        Ok(())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

pub fn get_phantom_power_state(card_index: &str, mic_name: &str) -> Result<bool, String> {

    let output = Command::new("amixer")
        .args(&["-c", &card_index, "get", mic_name])
        .output()
        .map_err(|e| format!("Failed to execute amixer: {}", e))?;

    let stdout = String::from_utf8_lossy(&output.stdout);

    let mut is_phantom_on = false;
    let mut mic_found = false;

    for line in stdout.lines() {
        if line.starts_with("Simple mixer control") && line.contains(mic_name) && line.contains("48V") {
            mic_found = true;
            continue;
        }

        if mic_found && line.contains("Mono: Playback") {
            is_phantom_on = line.contains("[on]");
            break;
        }
    }

    if mic_found {
        Ok(is_phantom_on)
    } else {
        Err(format!("Microphone {} not found", mic_name))
    }
}

pub fn get_line_input_sensitivity(card_index: &str, line_input_name: &str) -> Result<String, String> {

    let output = Command::new("amixer")
        .args(&["-c", &card_index, "get", line_input_name])
        .output()
        .map_err(|e| format!("Failed to execute amixer: {}", e))?;

        
    let stdout = String::from_utf8_lossy(&output.stdout);

    let mut sensitivity = String::new();
    let mut input_found = false;

    for line in stdout.lines() {
        if line.starts_with("Simple mixer control") && line.contains(line_input_name) {
            input_found = true;
            continue;
        }

        if input_found && line.contains("Item0:") {
            sensitivity = line.split(":").nth(1).unwrap().trim().to_string();
            break;
        }
    }

    if input_found {
        let cleaned_sensitivity = sensitivity.trim_matches('\'').to_string();
        Ok(cleaned_sensitivity)
    } else {
        Err(format!("Line input {} not found", line_input_name))
    }
}

pub fn set_line_input_sensitivity(card_index: &str, line_input_name: &str, sensitivity: &str) -> Result<(), String> {

    let output = Command::new("amixer")
        .args(&["-c", &card_index, "sset", line_input_name, "--", sensitivity])
        .output()
        .map_err(|e| e.to_string())?;

    if output.status.success() {
        Ok(())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}