const express = require('express');
const cors = require('cors');
const { jwt: { AccessToken } } = require('twilio');
const { VoiceGrant } = require('twilio/lib/jwt/AccessToken');
require('dotenv').config();

const app = express();
app.use(cors());

app.get('/token', (req, res) => {
  const identity = req.query.identity || 'user';

  const voiceGrant = new VoiceGrant({
    outgoingApplicationSid: process.env.TWILIO_TWIML_APP_SID,
    incomingAllow: true,
  });

  const token = new AccessToken(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_API_KEY,
    process.env.TWILIO_API_SECRET,
    { identity }
  );

  token.addGrant(voiceGrant);

  res.send({ token: token.toJwt() });
});

app.post('/voice', (req, res) => {
  const VoiceResponse = require('twilio').twiml.VoiceResponse;
  const twiml = new VoiceResponse();

  const dial = twiml.dial();
  dial.number(req.body.To); // call the number sent from frontend

  res.type('text/xml');
  res.send(twiml.toString());
});

app.use(express.static('public'))

app.get('/', (req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

const port = 3000;
app.listen(port, () => {
  console.log(`Token server running on http://localhost:${port}`);
});
