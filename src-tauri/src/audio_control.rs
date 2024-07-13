use std::process::Command;
use std::sync::Mutex;
use once_cell::sync::Lazy;
use regex::Regex;

static SOUND_CARD_NUMBER: Lazy<Mutex<Option<u32>>> = Lazy::new(|| Mutex::new(None));

pub fn initialize_sound_card(sound_card_name: &str) -> Result<u32, String> {
    match find_sound_card_number(sound_card_name) {
        Ok(card_number) => {
            let mut sound_card = SOUND_CARD_NUMBER.lock().unwrap();
            *sound_card = Some(card_number);
            println!("Successfully initialized sound card: {}", card_number);
            Ok(card_number)
        },
        Err(e) => {
            println!("Failed to initialize sound card: {}", e);
            Err(e)
        }
    }
}

fn find_sound_card_number(sound_card_name: &str) -> Result<u32, String> {
    println!("Searching for sound card: {}", sound_card_name);
    let output = Command::new("aplay")
        .arg("-l")
        .output()
        .map_err(|e| {
            println!("Failed to execute aplay: {}", e);
            e.to_string()
        })?;

    let stdout = String::from_utf8_lossy(&output.stdout);
    println!("aplay output:\n{}", stdout);

    for line in stdout.lines() {
        if line.contains(sound_card_name) {
            if let Some(card_num) = line.split_whitespace()
                .nth(1)
                .and_then(|s| s.trim_start_matches("card").trim_end_matches(':').parse().ok())
            {
                println!("Found sound card number: {}", card_num);
                return Ok(card_num);
            }
        }
    }

    println!("Sound card '{}' not found in aplay output", sound_card_name);
    Err(format!("Sound card '{}' not found", sound_card_name))
}

pub fn set_volume(control_name: &str, volume: i32) -> Result<(), String> {
    let sound_card_number = SOUND_CARD_NUMBER.lock().unwrap()
        .ok_or("Sound card number not initialized")?;
    
    // Clamp volume between 0 and 100
    let clamped_volume = volume.clamp(0, 100);
    
    let output = Command::new("amixer")
        .args(&["-c", &sound_card_number.to_string(), "set", control_name, &format!("{}%", clamped_volume)])
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
        .args(&["-n", "settings", "0", "clock.force-quantum", &value.to_string()])
        .output()
        .map_err(|e| e.to_string())?;

    if output.status.success() {
        Ok(())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

pub fn get_volume(control_name: &str) -> Result<i32, String> {
    let sound_card_number = SOUND_CARD_NUMBER.lock().unwrap()
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