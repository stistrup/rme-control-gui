<script setup lang="ts">
import { computed, inject, onMounted, ref, watch, watchEffect } from "vue";
import Fader from "./Fader.vue";
import Knob from "./Knob.vue";
import { RmeService } from "../services/RmeService";
import { InputType, RmeOutput } from "../types/rmeService.types";
import { useRmeStore } from "../stores/rmeStore";
import { MixerChannel } from "../types/rmeStore.types";
import { alsaConfig, lineSensitivity } from "../config/alsaConfig";

interface ChannelProps {
  channel: MixerChannel;
}

const props = defineProps<ChannelProps>();

const SEND_LEVEL_RANGE = 100; // Assuming a 0-100 range for send levels

const rmeService = inject<RmeService>("RmeService");
const rmeStore = useRmeStore();
const mainSendLevel = ref(0);
const headphonesSendLevel = ref(0);

const hasPhantomSupport = computed(() => {
  const alsaEntry = alsaConfig.inputs.find(
    (entry) => entry.input === props.channel.input
  );

  return !!alsaEntry?.controls.phantom;
});
const phantomOn = ref(false);
const currentLineSens = ref<string | null>(null);

if (!rmeService) {
  throw new Error("Could not load RME service");
}

const handleMainSendLevel = (newValue: number) => {
  const floatValue = newValue / SEND_LEVEL_RANGE;
  console.log("YOYOY?");
  rmeService
    .setSendLevel(props.channel, RmeOutput.MONITORS, floatValue)
    .catch((error) => console.error("Failed to set main send level:", error));
};

const handleHeadphonesSendLevel = (newValue: number) => {
  const floatValue = newValue / SEND_LEVEL_RANGE;
  rmeService
    .setSendLevel(props.channel, RmeOutput.HEADPHONES, floatValue)
    .catch((error) =>
      console.error("Failed to set headphones send level:", error)
    );
};

watchEffect(() => {
  console.log(props.channel.name, "main send level:", mainSendLevel.value);
  console.log(
    props.channel.name,
    "headphones send level:",
    headphonesSendLevel.value
  );
});

const getMainSendLevel = async () => {
  try {
    const levels = await rmeService.getSendLevel(
      props.channel,
      RmeOutput.MONITORS
    );

    if (levels) {
      const avarage = (levels.left + levels.right) / 2;
      mainSendLevel.value = avarage * SEND_LEVEL_RANGE;
      console.log("Monitor level for", props.channel.name, "is", avarage);
    }
  } catch (error) {
    console.error("Failed to get main send level:", error);
  }
};

const getHeadphonesSendLevel = async () => {
  try {
    const levels = await rmeService.getSendLevel(
      props.channel,
      RmeOutput.HEADPHONES
    );
    if (levels) {
      const avarage = (levels.left + levels.right) / 2;
      headphonesSendLevel.value = avarage * SEND_LEVEL_RANGE;

      console.log("Headphones level for", props.channel.name, "is", avarage);
    }
  } catch (error) {
    console.error("Failed to get headphones send level:", error);
  }
};

const handlePhantom = async () => {
  if (props.channel.inputType !== InputType.MIC) return;
  const newState = !phantomOn.value;
  const result = await rmeService.setPhantomPower(props.channel, newState);

  if (result) {
    phantomOn.value = newState;
  }
};

const handleLineSens = async (newSens: string) => {
  const result = await rmeService.setLineSensitivity(props.channel, newSens);
  if (result) {
    currentLineSens.value = newSens;
  }
};

const getPhantom = async () => {
  if (props.channel.inputType === InputType.MIC) {
    const phantomState = await rmeService.getPhantomState(props.channel);
    if (phantomState) {
      phantomOn.value = phantomState;
    }
  }
};

const getSensitivity = async () => {
  if (props.channel.inputType === InputType.LINE) {
    const newSens = await rmeService.getLineSensitivity(props.channel);
    if (newSens) {
      currentLineSens.value = newSens;
    }
  }
};

onMounted(async () => {
  getSensitivity();
  getPhantom();
  getMainSendLevel();
  getHeadphonesSendLevel();
  watch(
    () => rmeStore.activeProfile,
    async () => {
      getMainSendLevel();
      getHeadphonesSendLevel();
    }
  );
});
</script>

<template>
  <div :class="$style.channelContainer">
    <p :class="$style.label">{{ channel.name }}</p>
    <Knob
      label="HP Send"
      :model-value="headphonesSendLevel"
      :min="0"
      :max="SEND_LEVEL_RANGE"
      :step="1"
      @newValue="handleHeadphonesSendLevel"
    />
    <Fader
      label="Main Send"
      :model-value="mainSendLevel"
      :min="0"
      :max="SEND_LEVEL_RANGE"
      :step="1"
      @newValue="handleMainSendLevel"
    />
    <button
      v-if="hasPhantomSupport"
      :class="[$style.phantomButton, { [$style.phantomActive]: phantomOn }]"
      @click="handlePhantom"
    >
      48v
    </button>
    <div v-if="currentLineSens" :class="$style.lineSensContainer">
      <button
        :class="[
          $style.lineSens,
          { [$style.lineSensActive]: currentLineSens === lineSensitivity.high },
        ]"
        @click="handleLineSens(lineSensitivity.high)"
      >
        {{ lineSensitivity.high }}
      </button>
      <button
        :class="[
          $style.lineSens,
          { [$style.lineSensActive]: currentLineSens === lineSensitivity.low },
        ]"
        @click="handleLineSens(lineSensitivity.low)"
      >
        {{ lineSensitivity.low }}
      </button>
    </div>
  </div>
</template>

<style module>
.channelContainer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.phantomButton {
  background-color: #3a3a3a;
  border: unset;
  border-radius: 4px;
  color: #aaaaaa;
  filter: opacity(0.6);

  &.phantomActive {
    color: #ff7676;
    filter: unset;
  }
}

.lineSensContainer {
  display: flex;
  flex-direction: column;
  .lineSens {
    background-color: #3a3a3a;
    border: unset;
    border-radius: 4px;
    color: #aaaaaa;
    filter: opacity(0.6);

    &.lineSensActive {
      color: #f5f5f5;
      filter: unset;
    }
  }
}
</style>
