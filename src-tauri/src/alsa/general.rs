use std::process::Command;
use std::collections::HashMap;
use regex::Regex;
use std::fs;

pub fn get_card_number_by_name(card_name: &str) -> Result<String, String> {
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

pub fn get_soundcard_controls(card_index: &str) -> Result<HashMap<String, Vec<String>>, String> {

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

    Ok(controls)
}


pub fn parse_value_from_amixer_output(output: &str) -> Result<i32, String> {
    let re = Regex::new(r"(?m)^  Mono:( Playback)? (\d+)").unwrap();
    
    match re.captures(output) {
        Some(caps) => {
            // The volume will always be in the last capture group
            let volume_str = caps.get(caps.len() - 1).unwrap().as_str();
            match volume_str.parse::<i32>() {
                Ok(volume) => Ok(volume),
                Err(e) => Err(format!("Failed to parse volume as integer: {}", e))
            }
        },
        None => {
            eprintln!("Failed to parse volume from output: {}", output);
            Err("Could not parse volume from amixer output".to_string())
        }
    }
}

pub fn find_babyface_card() -> Result<String, String> {
    let cards_path = "/proc/asound/cards";
    // Get list of all ALSA sound devices
    let cards = fs::read_to_string(cards_path)
        .map_err(|e| format!("Failed to read cards: {}", e))?;

        println!("Searching for babyface card with vendor name 2a39:3fb0");

    for (i, line) in cards.lines().enumerate() {
        // Only read first of the 2 lines
        if i % 2 == 0 {
            // Get the index by reading the first white space separated text
            if let Some(card_index) = line.split_whitespace().next() {
                // get the usb ID from that index
                let usb_id_path = format!("/proc/asound/card{}/usbid", card_index);
                if let Ok(usb_id) = fs::read_to_string(usb_id_path) {
                    // Check if it matches with Rme Babyface Pro (class compliant)
                    if usb_id.trim() == "2a39:3fb0" {
                        // Extract the name in square brackets
                        if let Some(name) = line.split('[').nth(1).and_then(|s| s.split(']').next()) {
                            println!("Found name: {}", name.trim());
                            return Ok(name.trim().to_string());
                        }
                    }
                }
            }
        }
    }

    Err("No RME Babyface Pro found".to_string())
}