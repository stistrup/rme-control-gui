use super::general;

use std::process::Command;
use std::sync::Mutex;
use regex::Regex;
use lazy_static::lazy_static;
use std::collections::HashMap;

lazy_static! {
    static ref NODE_ID_CACHE: Mutex<HashMap<String, String>> = Mutex::new(HashMap::new());
}

pub fn set_input_volume(node_id: &str, gain: f32) -> Result<(), String> {
    let output = Command::new("pw-cli")
        .args(&["set-param", node_id, "Props", &format!("{{\"volume\": {}}}", gain)])
        .output()
        .map_err(|e| e.to_string())?;

    if output.status.success(){
        Ok(())
    } else {
        Err("Failed to set input gain".to_string())
    }
}

pub fn get_input_volume(node_id: &str) -> Result<f32, String> {
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

pub fn get_volume(target_port_name: &str) -> Result<f32, String> {
    let node_id = general::get_node_id_by_port_name(target_port_name)?;
    let gain = get_input_volume(&node_id)?;
    println!("Getting gain for {} (node: {}, gain: {}", target_port_name, node_id, gain);
    Ok(gain)
}

pub fn set_volume(target_port_name: &str, gain: f32) -> Result<(), String> {
    let clamped_gain = gain.clamp(0.0, 1.0);
    let node_id = general::get_node_id_by_port_name(target_port_name)?;
    println!("Setting gain for {} (node: {})  to {}", target_port_name, node_id, clamped_gain);
    set_input_volume(&node_id, clamped_gain)?;
    Ok(())
}