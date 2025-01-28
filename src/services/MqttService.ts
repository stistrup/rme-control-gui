import mqtt from 'mqtt';
import { EventEmitter } from 'events';
import type { App } from 'vue';

interface BrokerConfig{
    broker: string
}

let mqttConfig: BrokerConfig | undefined;
try {
    // This is not included in release or in source code
    // This is an extra feature for myself to control headphones and phantom power
    // from a custom physical device
    mqttConfig = await import('../config/mqttConf.json');
} catch (e) {
    console.warn("Not MQTT config. MQTT feature disabled")
}

export class MqttService extends EventEmitter {
    private client: mqtt.MqttClient | null = null;
    private readonly broker: string | undefined = mqttConfig?.broker;

    public async init(): Promise<void> {
        if (!this.broker) return;
        this.client = mqtt.connect(this.broker);
        
        this.client.on('connect', () => {
            console.log('Connected to MQTT broker');
            this.client?.subscribe('control_panel/out', (err) => {
                if (!err) {
                    console.log('Subscribed to control_panel/out (volume and phantom power)');
                }
            });
        });

        this.client.on('message', (topic, message) => {
            try {
                const payload = JSON.parse(message.toString());
                console.log(`Received message on topic ${topic}: ${message.toString()}`);
                
                if (topic === 'control_panel/out') {
                    if (payload.command === 'hp_volume') {
                        const percentage = (payload.potVal / 1024) * 100;
                        this.emit('volume', percentage);
                    }
                    if (payload.command === 'phantom') {
                        const state = payload.state === 1 ? true : false
                        this.emit('phantom', state);
                    }
                }
            } catch (error) {
                console.error('Failed to parse message:', error);
            }
        });

        // Add error handler for debugging
        this.client.on('error', (error) => {
            console.error('MQTT Error:', error);
        });
    }

    public disconnect(): void {
        this.client?.end();
    }
}

export default {
    install: (app: App) => {
      app.provide("MqttService", new MqttService());
    },
};