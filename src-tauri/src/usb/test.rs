use std::fs::File;
use std::os::unix::io::AsRawFd;
use nix::ioctl_read;
use nix::ioctl_write_ptr;

// Define the IOCTL commands (you'll need to find the correct values for your device)
ioctl_read!(snd_ctl_read, b'U', 0x10, i32);
ioctl_write_ptr!(snd_ctl_write, b'U', 0x11, i32);

pub struct ALSARawDevice {
    file: File,
}

impl ALSARawDevice {
    pub fn new(card: &str) -> std::io::Result<Self> {
        let file = File::open(format!("/dev/snd/controlC{}", card))?;
        Ok(ALSARawDevice { file })
    }

    pub fn read_control(&self, control_number: i32) -> nix::Result<i32> {
        let mut value = 0;
        unsafe {
            snd_ctl_read(self.file.as_raw_fd(), &mut value as *mut i32, control_number)?;
        }
        Ok(value)
    }

    pub fn write_control(&self, control_number: i32, value: i32) -> nix::Result<()> {
        unsafe {
            snd_ctl_write(self.file.as_raw_fd(), &value as *const i32, control_number)?;
        }
        Ok(())
    }
}