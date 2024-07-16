use std::process::Command;

pub fn set_buffer_size(buffer_size: u32) -> Result<(), String> {
    if buffer_size < 32 || buffer_size > 2048 || (buffer_size & (buffer_size - 1)) != 0 {
        return Err("The buffer size must be a power of two between 32 and 8192".to_string());
    }

    let output = Command::new("pw-metadata")
        .args(&["-n", "settings", "0", "clock.force-quantum", &buffer_size.to_string()])
        .output()
        .map_err(|e| format!("Failed to execute pw-metadata: {}", e))?;

    if output.status.success() {
        println!("Audio buffer set to {}", buffer_size);
        Ok(())
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr);
        println!("pw-metadata stderr: {}", stderr);
        Err(stderr.to_string())
    }
}
