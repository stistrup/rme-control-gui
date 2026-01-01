use std::process::Command;

pub fn get_clock_quantum() -> Result<u32, String> {
    let output = Command::new("pw-metadata")
        .args(&["-n", "settings"])
        .output()
        .map_err(|e| format!("Failed to execute pw-metadata: {}", e))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("pw-metadata failed: {}", stderr));
    }

    let stdout = String::from_utf8_lossy(&output.stdout);

    // First check if clock.force-quantum is set and non-zero
    for line in stdout.lines() {
        if line.contains("clock.force-quantum") {
            if let Some(value_str) = extract_value_from_line(line) {
                if let Ok(value) = value_str.parse::<u32>() {
                    if value > 0 {
                        println!("Current clock quantum (force-quantum): {}", value);
                        return Ok(value);
                    }
                }
            }
        }
    }

    // If force-quantum is 0 or not set, check clock.quantum
    for line in stdout.lines() {
        if line.contains("clock.quantum") && !line.contains("force") && !line.contains("min") && !line.contains("max") {
            if let Some(value_str) = extract_value_from_line(line) {
                if let Ok(value) = value_str.parse::<u32>() {
                    println!("Current clock quantum (quantum): {}", value);
                    return Ok(value);
                }
            }
        }
    }

    Err("Could not find clock quantum in pw-metadata output".to_string())
}

fn extract_value_from_line(line: &str) -> Option<String> {
    // Parse lines like: update: id:0 key:'clock.quantum' value:'1024' type:''
    if let Some(value_part) = line.split("value:'").nth(1) {
        if let Some(value) = value_part.split('\'').next() {
            return Some(value.to_string());
        }
    }
    None
}

pub fn set_clock_quantum(quantum: u32) -> Result<(), String> {
    if quantum < 32 || quantum > 2048 || (quantum & (quantum - 1)) != 0 {
        return Err("The clock quantum must be a power of two between 32 and 2048".to_string());
    }

    let output = Command::new("pw-metadata")
        .args(&["-n", "settings", "0", "clock.force-quantum", &quantum.to_string()])
        .output()
        .map_err(|e| format!("Failed to execute pw-metadata: {}", e))?;

    if output.status.success() {
        println!("Clock quantum set to {}", quantum);
        Ok(())
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr);
        println!("pw-metadata stderr: {}", stderr);
        Err(stderr.to_string())
    }
}
