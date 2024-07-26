<script setup lang="ts">
import { computed, inject, onMounted, ref, watch } from "vue";
import Fader from "./Fader.vue";
import Knob from "./Knob.vue";
import { RmeService } from "../services/RmeService";
import { InputType, RmeOutput } from "../types/rmeService.types";
import { useRmeStore } from "../stores/rmeStore";
import { MixerChannel } from "../types/rmeStore.types";
import { alsaConfig, lineSensitivity } from "../config/alsaConfig";
import {
  applyExponentialCurve,
  removeExponentialCurve,
} from "../utils/logConvertion";

interface ChannelProps {
  channel: MixerChannel;
}

const props = defineProps<ChannelProps>();

const VISUAL_RANGE_MULTIPLIER = 100;

const rmeService = inject<RmeService>("RmeService");
const rmeStore = useRmeStore();
const mainSendLevel = ref(0);
const headphonesSendLevel = ref(0);

const hasPhantomSupport = computed(() => {
  const alsaEntry = alsaConfig.inputs.find(
    (entry) => entry.id === props.channel.id
  );

  return !!alsaEntry?.controls.phantom;
});
const phantomOn = ref(false);
const currentLineSens = ref<string | null>(null);

if (!rmeService) {
  throw new Error("Could not load RME service");
}

const handleMainSendLevel = (newValue: number) => {
  const floatValue = newValue / VISUAL_RANGE_MULTIPLIER;
  const floatValueExp = applyExponentialCurve(floatValue);
  rmeService
    .setSendLevel(props.channel, RmeOutput.MONITORS, floatValueExp)
    .catch((error) => console.error("Failed to set main send level:", error));
};

const handleHeadphonesSendLevel = (newValue: number) => {
  const floatValue = newValue / VISUAL_RANGE_MULTIPLIER;
  const floatValueExp = applyExponentialCurve(floatValue);
  rmeService
    .setSendLevel(props.channel, RmeOutput.HEADPHONES, floatValueExp)
    .catch((error) =>
      console.error("Failed to set headphones send level:", error)
    );
};

const getMainSendLevel = async () => {
  try {
    const levels = await rmeService.getSendLevel(
      props.channel,
      RmeOutput.MONITORS
    );

    if (levels) {
      const avarage = (levels.left + levels.right) / 2;
      const avarageLinear = removeExponentialCurve(avarage);
      mainSendLevel.value = avarageLinear * VISUAL_RANGE_MULTIPLIER;
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
      const avarageLinear = removeExponentialCurve(avarage);
      headphonesSendLevel.value = avarageLinear * VISUAL_RANGE_MULTIPLIER;
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
      :max="VISUAL_RANGE_MULTIPLIER"
      :step="1"
      @newValue="handleHeadphonesSendLevel"
    />
    <Fader
      label="Main Send"
      :model-value="mainSendLevel"
      :min="0"
      :max="VISUAL_RANGE_MULTIPLIER"
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
