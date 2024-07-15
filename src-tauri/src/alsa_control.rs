use once_cell::sync::Lazy;
use regex::Regex;
use std::process::Command;
use std::sync::Mutex;

static SOUND_CARD_NUMBER: Lazy<Mutex<Option<u32>>> = Lazy::new(|| Mutex::new(None));

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

pub fn find_sound_card_number(sound_card_name: &str) -> Result<u32, String> {
    println!("Searching for sound card: {}", sound_card_name);
    let output = Command::new("aplay").arg("-l").output().map_err(|e| {
        println!("Failed to execute aplay: {}", e);
        e.to_string()
    })?;

    let stdout = String::from_utf8_lossy(&output.stdout);

    for line in stdout.lines() {
        if line.contains(sound_card_name) {
            if let Some(card_num) = line.split_whitespace().nth(1).and_then(|s| {
                s.trim_start_matches("card")
                    .trim_end_matches(':')
                    .parse()
                    .ok()
            }) {
                println!("Found sound card: {}", line);
                let mut sound_card = SOUND_CARD_NUMBER.lock().unwrap();
                *sound_card = Some(card_num);
                return Ok(card_num);
            }
        }
    }

    println!("Sound card '{}' not found in aplay output", sound_card_name);
    println!("aplay output:\n{}", stdout);
    Err(format!("Sound card '{}' not found", sound_card_name))
}

pub fn set_volume(control_name: &str, volume: i32) -> Result<(), String> {
    let sound_card_number = SOUND_CARD_NUMBER
        .lock()
        .unwrap()
        .ok_or("Sound card number not initialized")?;

    // Clamp volume between 0 and 100
    let clamped_volume = volume.clamp(0, 100);

    let output = Command::new("amixer")
        .args(&[
            "-c",
            &sound_card_number.to_string(),
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

pub fn change_buffer_size(value: u32) -> Result<(), String> {
    let output = Command::new("pw-metadata")
        .args(&[
            "-n",
            "settings",
            "0",
            "clock.force-quantum",
            &value.to_string(),
        ])
        .output()
        .map_err(|e| e.to_string())?;

    if output.status.success() {
        Ok(())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

pub fn get_volume(control_name: &str) -> Result<i32, String> {
    let sound_card_number = SOUND_CARD_NUMBER
        .lock()
        .unwrap()
        .ok_or("Sound card number not initialized")?;

    let output = Command::new("amixer")
        .args(&["-c", &sound_card_number.to_string(), "get", control_name])
        .output()
        .map_err(|e| e.to_string())?;

    if output.status.success() {
        let stdout = String::from_utf8_lossy(&output.stdout);
        parse_volume_from_amixer_output(&stdout)
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

fn parse_volume_from_amixer_output(output: &str) -> Result<i32, String> {
    let re = Regex::new(r"(\d+)%").unwrap();
    if let Some(caps) = re.captures(output) {
        caps[1].parse::<i32>().map_err(|e| e.to_string())
    } else {
        Err("Could not parse volume from amixer output".to_string())
    }
}

pub fn get_initial_states() -> Result<(i32, i32), String> {
    let headphones_volume = get_volume("PCM-AN1-PH3")?;
    let monitors_volume = get_volume("PCM-AN1-AN1")?;
    Ok((headphones_volume, monitors_volume))
}

// pub fn set_channel_volume(card_name: &str, channel: &str, volume: i64) -> Result<(), String> {
//     let mixer = Mixer::new(&card_name, false).map_err(|e| e.to_string())?;
//     let selem = mixer.find_selem(&mixer::SelemId::new(channel, 0)).ok_or("Channel not found")?;

//     if !selem.has_volume() {
//         return Err("Channel does not have volume control".to_string());
//     }

//     let (min, max) = selem.get_volume_range().map_err(|e| e.to_string())?;
//     let scaled_volume = min + (max - min) * volume / 100;

//     selem.set_volume_all(scaled_volume).map_err(|e| e.to_string())?;
//     Ok(())
// }

// pub fn get_channel_volume(card_name: &str, channel: &str) -> Result<i64, String> {
//     let mixer = Mixer::new(&card_name, false).map_err(|e| e.to_string())?;
//     let selem = mixer.find_selem(&mixer::SelemId::new(channel, 0)).ok_or("Channel not found")?;

//     if !selem.has_volume() {
//         return Err("Channel does not have volume control".to_string());
//     }

//     let (min, max) = selem.get_volume_range().map_err(|e| e.to_string())?;
//     let volume = selem.get_volume(mixer::SelemChannelId::FrontLeft).map_err(|e| e.to_string())?;

//     Ok((volume - min) * 100 / (max - min))
// }

pub fn set_phantom_power(mic: &str, new_state: bool) -> Result<(), String> {
    let sound_card_number = SOUND_CARD_NUMBER
        .lock()
        .unwrap()
        .ok_or("Sound card number not initialized")?;
    
    let state = if new_state { "on" } else { "off" };
    
    let output = Command::new("amixer")
        .args(&["-c", &sound_card_number.to_string(), "set", mic, state])
        .output()
        .map_err(|e| e.to_string())?;
    
    if output.status.success() {
        Ok(())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

pub fn get_phantom_power_state(sound_card_name: &str, mic_name: &str) -> Result<bool, String> {
    let card_index = find_card_index(sound_card_name)?;

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

pub fn get_line_input_sensitivity(sound_card_name: &str, line_input_name: &str) -> Result<String, String> {
    let card_index = find_card_index(sound_card_name)?;

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

pub fn set_line_input_sensitivity(sound_card_name: &str, line_input_name: &str, sensitivity: &str) -> Result<(), String> {
    let card_index = find_card_index(sound_card_name)?;

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