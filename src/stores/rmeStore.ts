import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { AudioControl, AudioControls } from "../types/alsaOutput.types";
import { AudioProfile, TauriInputChannelConfig } from "../types/config.types";
import { audioProfilesConfig, babyfaceProConf, babyfaceProConfCombatabilityMode } from "../config/soundCardConfig";

interface ChannelVolume {
  [channelId: string]: {
    monitorSendDb: {left: number, right: number},
    hpSendDb: {left: number, right: number},
    gainDb?: number
  }
}

interface MainVolume {
  [channelId: string]: {
    left: number,
    right: number
  }
}

export const useRmeStore = defineStore("rme", () => {
  const soundCardConfig = ref(babyfaceProConf)
  const alsaControls = ref<AudioControls>({});
  const activeProfile = ref<null | AudioProfile>(null);
  const supportedProfiles = ref<string[]>([]);
  const isCompatabilityMode = ref(false)
  const channelVolumes = ref<ChannelVolume>({})
  const mainVolumes = ref<MainVolume>({})

  const inputs = computed(() => {
    return soundCardConfig.value.inputs
  })
  const outputs = computed(() => {
    return soundCardConfig.value.outputs
  })
  const playback = computed(() => {
    return soundCardConfig.value.playback
  })

  const isInitialized = ref<boolean | null>(null);

  const setChannelMonitorSend = (channelId: string, leftValue: number, rightValue: number) => {
    if (!channelVolumes.value[channelId]) {
      channelVolumes.value[channelId] = {
        monitorSendDb: {left: 0, right: 0},
        hpSendDb: {left: 0, right: 0}
      }
    }
    channelVolumes.value[channelId].monitorSendDb = {
      left: leftValue,
      right: rightValue
    }
  }

  const setChannelHpSend = (channelId: string, leftValue: number, rightValue: number) => {
    if (!channelVolumes.value[channelId]) {
      channelVolumes.value[channelId] = {
        monitorSendDb: {left: 0, right: 0},
        hpSendDb: {left: 0, right: 0}
      }
    }
    channelVolumes.value[channelId].hpSendDb = {
      left: leftValue,
      right: rightValue
    }
  }

  const setChannelGain = (channelId: string, value: number) => {
    if (!channelVolumes.value[channelId]) {
      channelVolumes.value[channelId] = {
        monitorSendDb: {left: 0, right: 0},
        hpSendDb: {left: 0, right: 0}
      }
    }
    channelVolumes.value[channelId].gainDb = value
  }

  const setMainVolume = (channelId: string, leftValue: number, rightValue: number) => {
    mainVolumes.value[channelId] = {
      left: leftValue,
      right: rightValue
    }
  }

  // Get the stereo pair for a channel if it exists
  const getRightChannelFromStereo = (leftChannelId: string) => {
    const leftInput = inputs.value.find(input => input.controlName === leftChannelId)

    if (leftInput){
      const rightInput = inputs.value.find(input => input.inputIndex === (leftInput.inputIndex + 1))
      if (leftInput && rightInput) {
        return rightInput
      }
    }
  };

  // Filter inputs to only show unpaired channels and left channels of stereo pairs
  const visibleChannels = computed(() => 
    inputs.value.filter(channel => {
      const isLeftChannel = channel.inputIndex % 2 === 0

      if (isLeftChannel) return true
      else {
        const leftChannel = inputs.value.find(input => input.inputIndex === (channel.inputIndex -1))
        if (leftChannel && leftChannel.stereoCoupled) return false
      }

      return true
  }));
  
  const setActiveProfile = (newProfile: string) => {
    const isSupported = supportedProfiles.value.includes(newProfile)
    const targetProfile = audioProfilesConfig.find(profile => profile.profileName === newProfile)
    if (isSupported && targetProfile) {
      activeProfile.value = targetProfile;
    } else {
      console.warn(`Profile "${newProfile}" is not supported`);
    }
  };

  const setControls = (newControls: AudioControls) => {
    alsaControls.value = newControls;
  };

  const getControlByName = (controlName: string) => {
    return alsaControls.value[controlName]
  }

  const setInputChannelConfig = (inputChannels: TauriInputChannelConfig[]) => {
    inputs.value.forEach((input) => {
      const inputChannelConf = inputChannels.find(inputChannel => inputChannel.control_name === input.controlName)

      if (inputChannelConf) {
        input.displayName = inputChannelConf.display_name
        input.stereoCoupled = inputChannelConf.stereo_coupled
      }
    })
  }

  const setStereoCouple = (leftInputId: string, isStereoCoupled: boolean) => {
    const channel = inputs.value.find(input => input.controlName === leftInputId)
    if (!channel) return
    const isLeftChannel = channel.inputIndex % 2 === 0
    
    if (isLeftChannel) {
      channel.stereoCoupled = isStereoCoupled
    } else {
      console.error('Cannot set stereo coupling on right channel')
    }
  }

  const setSupportedProfiles = (profiles: string[]) => {
    supportedProfiles.value = profiles;
  };

  const setCompatabilityMode = () => {
    soundCardConfig.value = babyfaceProConfCombatabilityMode
    isCompatabilityMode.value = true
  }

  function updateControl(controlName: string, updatedControl: AudioControl) {
    if (alsaControls.value[controlName]) {
      alsaControls.value[controlName] = updatedControl;
    }
  }

  return {
    activeProfile,
    alsaControls,
    channelVolumes,
    inputs,
    isCompatabilityMode,
    isInitialized,
    mainVolumes,
    outputs,
    playback,
    soundCardConfig,
    supportedProfiles,
    visibleChannels,
    getControlByName,
    getRightChannelFromStereo,
    setActiveProfile,
    setChannelGain,
    setChannelHpSend,
    setChannelMonitorSend,
    setCompatabilityMode,
    setControls,
    setInputChannelConfig,
    setMainVolume,
    setStereoCouple,
    setSupportedProfiles,
    updateControl,
  };
});
