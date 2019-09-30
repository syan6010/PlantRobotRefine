const linebot = require('linebot');
const express = require('express');
const firebase = require("firebase");
const schedule = require('node-schedule');



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

var mini = ["虎尾蘭", "蘆薈", "仙人掌"]; //多肉植物
var mini_a = ["黃金葛", "合果芋"] //芋科室內植物
var large = ["茉莉花", "百合花", "玫瑰花"]; ///香花植物
var large_a = ["薄荷", "迷迭香"]; //香草植物
var large_b = ["橡皮樹", "發財樹"]; //大型室内植物


let line_id_ref = firebase.database().ref(`user_device`)
let plant_ref = firebase.database().ref(`plant_condition/123/2019-8-22`)





bot.on('message', function (event) {
  if (event.message.type === 'text') {
    let lineId = event.source.userId
    let ref = firebase.database().ref(`user_device/${lineId}/step`)
    let msg = event.message.text


    ref.once('value')
      .then(function(snapshot) {
        if(snapshot.exists()) {
          let step = snapshot.val()
          switch (step) {
            case 0 :
              updateData(lineId, "deviceId", msg);        
              event.reply({
                type: 'template',
                altText: 'this is a carousel template',
                template: {
                  type: 'carousel',
                  columns: [{
                    thumbnailImageUrl: 'https://example.com/bot/images/item2.jpg',
                    title: '多肉植物',
                    text: '多肉植物又被稱作肉質植物，像是虎尾蘭,蘆薈,仙人掌等',
                    actions: [{
                      type: 'message',
                      label: '選擇',
                      text: '多肉植物'
                    }]
                  }, {
                    thumbnailImageUrl: 'https://example.com/bot/images/item2.jpg',
                    title: 'this is menu',
                    text: 'description',
                    actions: [{
                      type: 'postback',
                      label: 'Add to cart',
                      data: 'action=add&itemid=111'
                    }, {
                      type: 'postback',
                      label: 'Add to cart',
                      data: 'action=add&itemid=111'
                    }, {
                      type: 'postback',
                      label: 'Add to cart',
                      data: 'action=add&itemid=111'
                    }]
                  }]
                }
              });
              break;
            case 1:
              if(mini.includes(msg)) { 
                updateData(lineId, "dhtStandard", 75)
              } 
              else if(mini_a.includes(msg)){
                updateData(lineId, "dhtStandard", 70)
              }
              else if(large.includes(msg)){
                updateData(lineId, "dhtStandard", 60)
              }
              else if(large_a.includes(msg)){
                updateData(lineId, "dhtStandard", 40)
              }
              else if(large_b.includes(msg)){
                updateData(lineId, "dhtStandard", 50)
              }
              else {
                updateData(lineId, "dhtStandard", 60)
              }
              updateData(lineId, "plantType", msg)
              event.reply({
                type: 'template',
                altText: '現在自動澆水功能都設定好嘍！！每週都會幫你推送我的健康數據，要好好照顧我喔！',
                template: {
                  type: 'confirm',
                  text: '你可以問我的內容',
                  actions: [{
                    type: 'message',
                    label: '如何照顧我',
                    text: '如何照顧我'
                  }, {
                    type: 'message',
                    label: '重新選擇我的種類',
                    text: '重設'
                  }]
                }
              });
              break;
            default :
              switch (msg) {
                case '如何照顧我' :
                  event.reply({
                    type: 'template',
                    altText: 'this is a carousel template',
                    template: {
                      type: 'carousel',
                      columns: [{
                        thumbnailImageUrl: 'https://example.com/bot/images/item1.jpg',
                        title: 'this is menu',
                        text: 'description',
                        actions: [{
                          type: 'postback',
                          label: 'Buy',
                          data: 'action=buy&itemid=111'
                        }, {
                          type: 'postback',
                          label: 'Add to cart',
                          data: 'action=add&itemid=111'
                        }, {
                          type: 'uri',
                          label: 'View detail',
                          uri: 'http://example.com/page/111'
                        }]
                      }, {
                        thumbnailImageUrl: 'https://example.com/bot/images/item2.jpg',
                        title: 'this is menu',
                        text: 'description',
                        actions: [{
                          type: 'postback',
                          label: 'Buy',
                          data: 'action=buy&itemid=222'
                        }, {
                          type: 'postback',
                          label: 'Add to cart',
                          data: 'action=add&itemid=222'
                        }, {
                          type: 'uri',
                          label: 'View detail',
                          uri: 'http://example.com/page/222'
                        }]
                      }]
                    }
                  });
                  break;
                case '重設' :
                  step = -1
                  event.reply('你好!!歡迎來到plantRobot!!第一次設定需要輸入webduino裝置的ID才可以讓我順利上網歐！!！')
                  break;
                default :
                  event.reply('i cant do this!!')
              }
          }
          if (step > 1) { updateData(lineId, "step", 99) }
          else { updateData(lineId, "step", step + 1) }
        }
        else {
            console.log('init')
            initData(lineId)
            event.reply('你好!!歡迎來到plantRobot!!第一次設定需要輸入webduino裝置的ID才可以讓我順利上網歐！！')
        }
      });
  }
});


app.listen(process.env.PORT || 80, function () {
  console.log('LineBot is running.');
});



let updateData = (lineId, postKey, postData) => {
    let updates = {};
    updates[`user_device/${lineId}/${postKey}`] = postData;
  
    return firebase.database().ref().update(updates);
}

let initData = (lineId) => {
    firebase.database().ref('user_device/' + lineId).set({
        deviceId: 0,
        dhtStandard: 0,
        name : 0,
        plantType : 0,
        step : 0,
        waterTime : 0
    });
}




const  scheduleCronstyle = ()=>{
    schedule.scheduleJob('30 58 * * * *',()=>{
      plant_ref.once('value')
        .then(function(snapshot){
          snapshot.forEach(function (childSnapshot){
            let dht = childSnapshot.child("dht").val()
            console.log(dht)
            bot.push("U0b6e923254483d85b37802373341c02d", `${dht}`)
          })
        })


      line_id_ref.once('value')
        .then(function(snapshot){
          snapshot.forEach(function(childSnapshot){
            let each_id = childSnapshot.key
            let each_plant_type = firebase.database().ref(`user_device/${each_id}/plantType`)
            each_plant_type.once('value')
              .then(function(snapshot){
                let p_type = snapshot.val()
                if(mini.includes(p_type)) { 
                  bot.push(each_id, '多肉植物')
                } 
                else if(mini_a.includes(p_type)){
                  bot.push(each_id, '芋科室內植物')
                }
                else if(large.includes(p_type)){
                  bot.push(each_id, '香花植物')
                }
                else if(large_a.includes(p_type)){
                  bot.push(each_id, '香草植物')
                }
                else if(large_b.includes(p_type)){
                  bot.push(each_id, '大型室内植物')
                }
                else {
                  bot.push(each_id, '????')
                }
              })
      
          })  
        })
    }); 
}

scheduleCronstyle();