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

let lineId;
var qAndAStep;


bot.on('message', function (event) {
    // var myReply='';
      if (event.message.type === 'text') {
          lineId = event.source.userId;
  
  
          firebase.database().ref(`users/${lineId}/steps`).on('value', async function (snapshot) {
              if(snapshot.exists()) {
                  qAndAStep = snapshot.val();
                  if (qAndAStep === 0 ) {
                      await event.reply('你好!!歡迎來到plantRobot!!第一次設定需要輸入webduino裝置的ID才可以讓我順利上網歐！！');
                  } else if(qAndAStep === 1) {
                      event.reply('可以告訴我你的植物種類嗎？');
                      updateData(lineId, "deviceId", event.message.text);
                  } else if(qAndAStep === 2) {
                      event.reply('謝謝！我們又邁進了一步！！可以讓我知道要怎麼稱呼你嗎？');
                      updateData(lineId, "plantType", event.message.text);
                  } else if(qAndAStep === 3) {
                      event.reply('謝謝接下來我們馬上就可以開始使用了！！輸入OK取得資訊!!!!!!!');
                      updateData(lineId, "name", event.message.text);
                  } else if(qAndAStep === 99) {
                      switch (event.message.text) {
                          case 'help' :
                              event.reply({
                                  type: 'image',
                                  originalContentUrl: 'https://d.line-scdn.net/stf/line-lp/family/en-US/190X190_line_me.png',
                                  previewImageUrl: 'https://d.line-scdn.net/stf/line-lp/family/en-US/190X190_line_me.png'
                              });
                              break;
                          case 'ok' :
                              firebase.database().ref(`users/${lineId}/plantType`).once('value', function (snapshot) {
                                  var data = snapshot.val();
                                  switch (data) {
                                      case '薄荷' :
                                          return event.reply(['Line 1', {
                                              type: 'template',
                                              altText: 'Buttons alt text',
                                              template: {
                                                  type: 'buttons',
                                                  thumbnailImageUrl: 'https://i2.kknews.cc/SIG=m8bseq/o0p0008q8qoq4pn7493.jpg',
                                                  title: 'My button sample',
                                                  text: 'Hello, my button',
                                                  actions: [
                                                      { label: 'Go to line.me', type: 'uri', uri: 'https://line.me' },
                                                      { label: 'Say hello1', type: 'postback', data: 'hello こんにちは' },
                                                      { label: '言 hello2', type: 'postback', data: 'hello こんにちは', text: 'hello こんにちは' },
                                                      { label: 'Say message', type: 'message', text: 'Rice=米' },
                                                  ],
                                              },
                                          }]);
                                      default :
                                          event.reply('這種植物我建議你還是別種了');
                                  }
                              });
                              break;
                          case '重設' :
                              qAndAStep = -1; 
                              event.reply('ok輸入y開始重新設定');
                              break;
                          // case 'led開' :
                          //     if (!deviceIsConnected())
                          //         event.reply('裝置未連接');
                          //     else{                       
                          //         myResult='LED已打開！';
                          //         rgbled.setColor('#ffffff');                   
                          //     }
                          //     break;
                          // case 'led關' :
                          //     if (!deviceIsConnected())
                          //         event.reply('裝置未連接');
                          //     else{
                          //         myResult='LED已關閉！';
                          //         rgbled.setColor('#000000');
                          //     }
                          //     break;
                          default:
                              event.reply('我不能這麼做!!');
                        }
                  }
  
   
              } 
              else {
                  firebase.database().ref('users/' + lineId).set({
                      deviceId: 0,
                      plantType: 0,
                      name : 0,
                      dht : 0,
                      temperature : 0,
                      steps : 0
                  });
                  qAndAStep = 0;
              }
          });
         
          updateData(lineId, "steps" ,qAndAStep+1);
            
          if(qAndAStep > 3) {
              updateData(lineId, "steps", 99);
          };
          
  
      }  
     
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
