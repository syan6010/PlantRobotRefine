const linebot = require('linebot');
const express = require('express');
const firebase = require("firebase");


const bot = linebot({
  channelId: process.env.CHANNEL_ID,
  channelSecret: process.env.CHANNEL_SECRET,
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN
});

var config = {
    apiKey: process.env.apiKey,
    authDomain: process.env.authDomain,
    databaseURL: process.env.databaseURL,
    projectId: process.env.projectId,
    storageBucket: process.env.storageBucket,
    messagingSenderId: process.env.messagingSenderId
  };

firebase.initializeApp(config);

const app = express();

const linebotParser = bot.parser();

app.post('/linewebhook', linebotParser);



bot.on('message', function (event) {
    let lineId = event.source.userId
    let step = 0
    firebase.database().ref(`users/${lineId}/steps`).on('value', async function (snapshot) {
        if(snapshot.exists()) 
        {
            // step = await snapshot.val()
            event.reply('exist')

        }
        else 
        {
            initData(lineId);
            event.reply('你好!!歡迎來到plantRobot!!第一次設定需要輸入webduino裝置的ID才可以讓我順利上網歐！！')
        }
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


let initData = (lineId) => {
    firebase.database().ref('users/' + lineId).set({
        deviceId: 0,
        plantType: 0,
        name : 0,
        dht : 0,
        temperature : 0,
        steps : 0
    });
}
