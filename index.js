const linebot = require('linebot');
const express = require('express');

const bot = linebot({
  channelId: process.env.CHANNEL_ID,
  channelSecret: process.env.CHANNEL_SECRET,
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN
});

var config = {
    apiKey: "AIzaSyAH8TrJyIm1rc5Pf4Kv1QK1e196Btft_a8",
    authDomain: "plantrobotrefine.firebaseapp.com",
    databaseURL: "https://plantrobotrefine.firebaseio.com",
    projectId: "plantrobotrefine",
    storageBucket: "plantrobotrefine.appspot.com",
    messagingSenderId: "686852886099"
};

firebase.initializeApp(config);

const app = express();

const linebotParser = bot.parser();

app.post('/linewebhook', linebotParser);



bot.on('message', function (event) {
    event.reply(event.message.text).then(function (data) {
        console.log('Success', data);
    }).catch(function (error) {
        console.log('Error', error);
    });
});


app.listen(process.env.PORT || 80, function () {
  console.log('LineBot is running.');
});

let updateData = (lineId, postKey, postData) => {
    let updates = {};
    updates[`users/${lineId}/${postKey}`] = postData;
  
    return firebase.database().ref().update(updates);
}



