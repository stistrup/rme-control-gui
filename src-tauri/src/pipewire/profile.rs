use std::process::Command;
use regex::Regex;

pub fn get_active_profile(card_id: &str) -> Result<String, String> {
    let output = Command::new("pactl")
        .args(&["list", "cards"])
        .output()
        .map_err(|e| format!("Failed to execute pactl: {}", e))?;

    let stdout = String::from_utf8_lossy(&output.stdout);
    let card_info_re = Regex::new(&format!(r"Card #{}", card_id)).unwrap();
    let active_profile_re = Regex::new(r"Active Profile: (.+)").unwrap();
    
    let mut in_card_section = false;

    for line in stdout.lines() {
        if card_info_re.is_match(line) {
            in_card_section = true;
        } else if in_card_section && line.starts_with("Card #") {
            break;
        } else if in_card_section {
            if let Some(caps) = active_profile_re.captures(line) {
                return Ok(caps.get(1).unwrap().as_str().to_string());
            }
        }
    }

    Err(format!("Could not find active profile for card id: {}", card_id))
}

pub fn set_profile(card_id: &str, profile: &str) -> Result<(), String> {
    let output = Command::new("pactl")
        .args(&["set-card-profile", card_id, profile])
        .output()
        .map_err(|e| format!("Failed to execute pactl: {}", e))?;

    if output.status.success() {
        println!("Set profile for id {} to {}", card_id, profile);
        Ok(())
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr);
        Err(stderr.to_string())
    }
}

pub fn get_profiles(card_id: &str) -> Result<Vec<String>, String> {
    let output = Command::new("pactl")
        .args(&["list", "cards"])
        .output()
        .map_err(|e| format!("Failed to execute pactl: {}", e))?;

    let stdout = String::from_utf8_lossy(&output.stdout);
    let card_info_re = Regex::new(&format!(r"Card #{}", card_id)).unwrap();
    let profile_re = Regex::new(r"\s+(.+):\s.+\s\(sinks:.+sources:.+\spriority:.+\savailable: (yes|no)\)").unwrap();
    
    let mut in_card_section = false;
    let mut profiles = Vec::new();

    for line in stdout.lines() {
        if card_info_re.is_match(line) {
            in_card_section = true;
        } else if in_card_section && line.starts_with("Card #") {
            break;
        } else if in_card_section {
            if let Some(caps) = profile_re.captures(line) {
                profiles.push(caps.get(1).unwrap().as_str().to_string());
            }
        }
    }

    if profiles.is_empty() {
        Err(format!("Could not find profiles for card id: {}", card_id))
    } else {
        Ok(profiles)
    }
}
