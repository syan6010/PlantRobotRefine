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
                step = await snapshot.val();
                if (step === 0 ) {
                    await event.reply('你好!!歡迎來到plantRobot!!第一次設定需要輸入webduino裝置的ID才可以讓我順利上網歐！！');
                } else if(step === 1) {
                    event.reply('可以告訴我你的植物種類嗎？');
                    updateData(lineId, "deviceId", event.message.text);
                } else if(step === 2) {
                    event.reply('謝謝！我們又邁進了一步！！可以讓我知道要怎麼稱呼你嗎？');
                    updateData(lineId, "plantType", event.message.text);
                } else if(step === 3) {
                    event.reply('謝謝接下來我們馬上就可以開始使用了！！輸入OK取得資訊!!!!!!!');
                    updateData(lineId, "name", event.message.text);
                } else if(step === 99) {
                    event.reply('99')
                }

        }
        else 
        {
            event.reply('hahaha')
            initData(lineId);
        }
 
        updateData(lineId, "steps" , step+1)
          
        if(qAndAStep > 3) 
        {
            updateData(lineId, "steps", 99)
        };

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
        PlantName: 0,
        WebId: 0,
        name : 0,
        dht : 0,
        temperature : 0,
        steps : 0
    });    
}



