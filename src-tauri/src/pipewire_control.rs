use std::process::Command;
use std::sync::Mutex;
use regex::Regex;
use lazy_static::lazy_static;
use std::collections::HashMap;

lazy_static! {
    static ref NODE_ID_CACHE: Mutex<HashMap<String, String>> = Mutex::new(HashMap::new());
}

pub fn find_pipewire_node_id(target_port_name: &str) -> Result<String, String> {
    let output = Command::new("pw-cli")
        .args(&["info", "all"])
        .output()
        .map_err(|e| format!("Failed to execute pw-cli: {}", e))?;
    
    let stdout = String::from_utf8_lossy(&output.stdout);

    let mut current_id: Option<String> = None;
    let mut current_node_id: Option<String> = None;
    let mut current_port_name: Option<String> = None;

    for line in stdout.lines() {
        if line.trim().starts_with("id: ") {
            if let (Some(node_id), Some(port_name)) = (&current_node_id, &current_port_name) {
                if port_name == target_port_name {
                    return Ok(node_id.clone());
                }
            }
            current_id = Some(line.split_whitespace().nth(1).unwrap_or("").to_string());
            current_node_id = None;
            current_port_name = None;
        }
        
        if let Some(_id) = &current_id {
            if line.contains("node.id") {
                current_node_id = line.split_whitespace().last().map(|s| s.trim_matches('"').to_string());
            } else if line.contains("port.name") {
                current_port_name = line.split_whitespace().last().map(|s| s.trim_matches('"').to_string());
            }
        }
    }

    if let (Some(node_id), Some(port_name)) = (&current_node_id, &current_port_name) {
        if port_name == target_port_name {
            return Ok(node_id.clone());
        }
    }

    Err(format!("Could not find node with port name: {}", target_port_name))
}

fn get_cached_node_id(target_port_name: &str) -> Result<String, String> {
    let mut cache = NODE_ID_CACHE.lock().unwrap();
    if let Some(node_id) = cache.get(target_port_name) {
        return Ok(node_id.clone());
    }
    let node_id = find_pipewire_node_id(target_port_name)?;
    cache.insert(target_port_name.to_string(), node_id.clone());
    Ok(node_id)
}

pub fn update_node_id_cache(target_port_name: &str) -> Result<(), String> {
    let node_id = find_pipewire_node_id(target_port_name)?;
    let mut cache = NODE_ID_CACHE.lock().unwrap();
    cache.insert(target_port_name.to_string(), node_id);
    Ok(())
}

pub fn set_input_gain(node_id: &str, gain: f32) -> Result<(), String> {
    let output = Command::new("pw-cli")
        .args(&["set-param", node_id, "Props", &format!("{{\"volume\": {}}}", gain)])
        .output()
        .map_err(|e| e.to_string())?;

    if output.status.success() {
        Ok(())
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr);
        println!("pw-cli stderr: {}", stderr);
        Err(stderr.to_string())
    }
}

pub fn get_input_gain(node_id: &str) -> Result<f32, String> {
    let output = Command::new("pw-cli")
        .args(&["enum-params", node_id, "2"])
        .output()
        .map_err(|e| e.to_string())?;

    if output.status.success() {
        let stdout = String::from_utf8_lossy(&output.stdout);
        parse_volume_from_pw_cli_output(&stdout)
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr);
        println!("pw-cli stderr: {}", stderr);
        Err(stderr.to_string())
    }
}

fn parse_volume_from_pw_cli_output(output: &str) -> Result<f32, String> {
    let re = Regex::new(r"Prop:\s+key\s+Spa:Pod:Object:Param:Props:volume\s+\(\d+\),\s+flags\s+\d+\s+Float\s+([0-9.]+)").unwrap();
    if let Some(caps) = re.captures(output) {
        caps[1].parse::<f32>().map_err(|e| e.to_string())
    } else {
        println!("Could not parse volume from pw-cli output: {}", output);
        Err("Could not parse volume from pw-cli output".to_string())
    }
}

pub fn get_gain(target_port_name: &str) -> Result<f32, String> {
    let node_id = get_cached_node_id(target_port_name)?;
    let gain = get_input_gain(&node_id)?;
    Ok(gain)
}

pub fn set_gain(target_port_name: &str, gain: f32) -> Result<(), String> {
    let clamped_gain = gain.clamp(0.0, 1.0);
    let node_id = get_cached_node_id(target_port_name)?;
    set_input_gain(&node_id, clamped_gain)?;
    Ok(())
}