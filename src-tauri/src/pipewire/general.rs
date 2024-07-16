use std::process::Command;

fn get_pipewire_info() -> Result<String, String> {
    let output = Command::new("pw-cli")
        .args(&["info", "all"])
        .output()
        .map_err(|e| format!("Failed to execute pw-cli: {}", e))?;
    
    Ok(String::from_utf8_lossy(&output.stdout).into_owned())
}

pub fn get_card_id_by_name(card_name: &str) -> Result<String, String> {
    let output = Command::new("pactl")
        .args(&["list", "cards", "short"])
        .output()
        .map_err(|e| format!("Failed to execute pactl: {}", e))?;

    let stdout = String::from_utf8_lossy(&output.stdout);
    for line in stdout.lines() {
        if line.contains(card_name) {
            return Ok(line.split_whitespace().next().unwrap_or("").to_string());
        }
    }

    Err(format!("Could not find card with name: {}", card_name))
}

pub fn get_object_id_by_port_name(target_port_name: &str) -> Result<String, String> {
    let stdout = get_pipewire_info()?;

    let mut current_object_id: Option<String> = None;
    let mut current_port_name: Option<String> = None;

    for line in stdout.lines() {
        if line.trim().starts_with("id: ") {
            if let Some(port_name) = &current_port_name {
                if port_name == target_port_name {
                    return Ok(current_object_id.unwrap());
                }
            }
            current_object_id = Some(line.split_whitespace().nth(1).unwrap_or("").to_string());
            current_port_name = None;
        }
        
        if current_object_id.is_some() && line.contains("port.name") {
            current_port_name = line.split_whitespace().last().map(|s| s.trim_matches('"').to_string());
        }
    }

    Err(format!("Could not find object ID for port name: {}", target_port_name))
}

pub fn get_node_id_by_port_name(target_port_name: &str) -> Result<String, String> {
    let stdout = get_pipewire_info()?;

    let mut current_object_id: Option<String> = None;
    let mut current_node_id: Option<String> = None;
    let mut current_port_name: Option<String> = None;

    for line in stdout.lines() {
        if line.trim().starts_with("id: ") {
            if let (Some(node_id), Some(port_name)) = (&current_node_id, &current_port_name) {
                if port_name == target_port_name {
                    return Ok(node_id.clone());
                }
            }
            current_object_id = Some(line.split_whitespace().nth(1).unwrap_or("").to_string());
            current_node_id = None;
            current_port_name = None;
        }
        
        if current_object_id.is_some() {
            if line.contains("node.id") {
                current_node_id = line.split_whitespace().last().map(|s| s.trim_matches('"').to_string());
            } else if line.contains("port.name") {
                current_port_name = line.split_whitespace().last().map(|s| s.trim_matches('"').to_string());
            }
        }
    }

    Err(format!("Could not find node ID for port name: {}", target_port_name))
}