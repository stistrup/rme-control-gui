import mqtt from 'mqtt';
import { EventEmitter } from 'events';
import type { App } from 'vue';

export class MqttService extends EventEmitter {
    private client: mqtt.MqttClient | null = null;

    public async init(broker: string): Promise<void> {
        if (!broker) return;
        this.client = mqtt.connect(broker);
        
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