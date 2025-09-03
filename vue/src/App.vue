<template>
  <div class="call-container">
    <h2>📞 Twilio Call Interface</h2>
    
    <input
      v-model="to"
      placeholder="Enter phone number"
      class="phone-input"
    />
    
    <div class="button-group">
      <button @click="makeCall" class="call-button">Call</button>
      <button @click="hangUp" class="hangup-button">Hang Up</button>
    </div>

    <div class="status">
      <strong>Status:</strong> {{ status }}
    </div>
  </div>
</template>

<script>
import { Device } from "@twilio/voice-sdk";
import axios from "axios";

export default {
  data() {
    return {
      device: null,
      to: "",
      status: "Initializing...",
    };
  },
  methods: {
    async initializeTwilio() {
      try {
        const response = await axios.get(
          "/token?identity=test-user"
        );
        const token = response.data.token;

        this.device = new Device(token, { debug: true });

        this.device.on("ready", () => {
          this.status = "Ready to call";
          console.log("Twilio Device is ready");
        });

        this.device.on("error", (error) => {
          this.status = "Error: " + error.message;
          console.error("Twilio Error:", error);
        });

        this.device.on("disconnect", () => {
          this.status = "Call disconnected";
          console.log("Call disconnected");
        });

        this.device.on("connect", () => {
          this.status = "On Call...";
        });

        this.device.on("incoming", (conn) => {
          this.status = "Incoming call...";
          conn.accept();
        });
      } catch (err) {
        this.status = "Failed to initialize Twilio";
        console.error(err);
      }
    },
    async requestMicrophoneAccess() {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log("Microphone access granted.");
      } catch (err) {
        this.status = "Microphone access denied.";
        console.error("Microphone access denied:", err);
      }
    },
    async makeCall() {
      if (!this.device) await this.initializeTwilio();

      this.status = `Calling ${this.to}...`;
      this.device.connect({ to: this.to });
    },
    hangUp() {
      if (this.device) {
        this.device.disconnectAll();
        this.status = "Call ended";
      }
    },
  },
  async mounted() {
    await this.requestMicrophoneAccess();
    await this.initializeTwilio();
  },
};
</script>

<style scoped>
.call-container {
  max-width: 400px;
  margin: 50px auto;
  padding: 30px;
  background: #333;
  color: #fff;
  border-radius: 12px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  text-align: center;
  font-family: "Segoe UI", sans-serif;
}

.phone-input {
  width: 100%;
  padding: 12px;
  margin-bottom: 20px;
  border: 2px solid #ccc;
  border-radius: 8px;
  font-size: 16px;
}

.button-group {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.call-button,
.hangup-button {
  flex: 1;
  padding: 10px 15px;
  font-size: 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.call-button {
  background-color: #28a745;
  color: white;
}

.call-button:hover {
  background-color: #218838;
}

.hangup-button {
  background-color: #dc3545;
  color: white;
}

.hangup-button:hover {
  background-color: #c82333;
}

.status {
  margin-top: 20px;
  font-size: 16px;
}
</style>
