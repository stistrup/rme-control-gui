<script setup lang="ts">
import { useRmeStore } from "../stores/rmeStore";

const rmeStore = useRmeStore();
</script>

<template>
  <div>
    <h2>Audio Controls</h2>
    <div v-if="rmeStore.isInitialized">
      <div v-for="control in rmeStore.controls" :key="control.name">
        <h3>{{ control.name }}</h3>
        <p>Capabilities: {{ control.capabilities.join(", ") }}</p>
        <p>Channels: {{ control.channels }}</p>
        <p>Limits: {{ control.limits.min }} - {{ control.limits.max }}</p>
        <div v-for="(value, channel) in control.values" :key="channel">
          <p>
            {{ channel }}: {{ value }} [{{
              Math.round(
                ((value - control.limits.min) /
                  (control.limits.max - control.limits.min)) *
                  100
              )
            }}%]
          </p>
        </div>
      </div>
    </div>
    <div v-else>Loading audio controls...</div>
  </div>
</template>
