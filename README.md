# rme-control-gui

A graphical interface interfacing with ALSA and Pipewire to give easy control to RME soundcard Babyface Pro

A fun little project to learn tauri and rust. Design will most likely look different later but i have some functionality i want to sort out first. 

IMPORTANT: If you wanna try this out yourself, you need to apply [this patch](https://github.com/stistrup/rme-gain-kernel-patch). It has been submitted and accepted into the kernel but won't be available until 6.11

![image](https://github.com/user-attachments/assets/021db914-f0e2-406b-b667-162300d76f97)

# Development

run "npm run tauri dev"

# Building

I'm using Manjaro, and to build it for manjaro use "npm run build-tauri". That will create an appimage that you can run as is. There might be a couple of dependencies you'd have to fix, the compiler will tell you. And at least for me, there is a bug with tauri and nvidia card, so i'd have to run the appimage with "WEBKIT_DISABLE_DMABUF_RENDERER=1" set. If you are using any debian based distro, you can change target to "deb" in src-tauri/tauri.conf.json. 

As i'm not really doing this to share it as a ready made package to install and run, i won't put much effort into making it a neat package ready to use on all distros etc, at least for now. Hopefully that will change in a near future. The tauri docs can probably answer most questions. 

# Tauri + Vue + TypeScript

This template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

## Type Support For `.vue` Imports in TS

Since TypeScript cannot handle type information for `.vue` imports, they are shimmed to be a generic Vue component type by default. In most cases this is fine if you don't really care about component prop types outside of templates. However, if you wish to get actual prop types in `.vue` imports (for example to get props validation when using manual `h(...)` calls), you can enable Volar's Take Over mode by following these steps:

1. Run `Extensions: Show Built-in Extensions` from VS Code's command palette, look for `TypeScript and JavaScript Language Features`, then right click and select `Disable (Workspace)`. By default, Take Over mode will enable itself if the default TypeScript extension is disabled.
2. Reload the VS Code window by running `Developer: Reload Window` from the command palette.

You can learn more about Take Over mode [here](https://github.com/johnsoncodehk/volar/discussions/471).
