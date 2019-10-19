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
let plant_ref = firebase.database().ref(`plant_condition`)




const today = new Date();





bot.on('message', function (event) {
  if (event.message.type === 'text') {
    let lineId = event.source.userId
    let ref = firebase.database().ref(`user_device/${lineId}/step`)
    let ref_pt = firebase.database().ref(`user_device/${lineId}/plantType`)
    let msg = event.message.text


    ref.once('value')
      .then(function(snapshot) {
        if(snapshot.exists()) {
          let step = snapshot.val()
          switch (step) {
            case 0 :
              updateData(lineId, "deviceId", msg);
              // event.reply('輸入植物種類')
              event.reply({
                type: 'template',
                altText: 'this is a carousel template',
                template: {
                  type: 'carousel',
                  columns: [{
                    thumbnailImageUrl: 'https://succuland.com.tw/wp-content/uploads/2016/05/DSC_0341-1024x686.jpg',
                    title: '多肉植物',
                    text: '多肉植物又被稱作肉質植物，像是虎尾蘭,蘆薈,仙人掌等',
                    actions: [{
                      type: 'message',
                      label: '虎尾蘭',
                      text: '虎尾蘭'
                    }, {
                      type: 'message',
                      label: '仙人掌',
                      text: '仙人掌'
                    }]
                  }, {
                    thumbnailImageUrl: 'https://static.betweengos.com/wp-content/uploads/2016/09/淨化空氣盆栽植物-1.jpg',
                    title: '芋科室內植物',
                    text: '是單子葉植物薑目的一科，像是黃金葛,合果芋等',
                    actions: [{
                      type: 'message',
                      label: '黃金葛',
                      text: '黃金葛'
                    }, {
                      type: 'message',
                      label: '合果芋',
                      text: '合果芋'
                    }]
                  }, {
                    thumbnailImageUrl: 'https://i1.wp.com/pic2.zhimg.com/50/8c5a9a9b736325f94cdad603a0834659_hd.jpg',
                    title: '香花植物',
                    text: '花朵清芳幽雅，用途極多，如茉莉花, 百合花, 玫瑰花',
                    actions: [{
                      type: 'message',
                      label: '茉莉花',
                      text: '茉莉花'
                    }, {
                      type: 'message',
                      label: '百合花',
                      text: '百合花'
                    }]
                  }, {
                    thumbnailImageUrl: 'https://pic.pimg.tw/mylifestyle/1430817274-2702571739.jpg',
                    title: '香草植物',
                    text: '香料植物，是指因為其香氣而用在食物、調味品、藥品及香料中的植物，如薄荷,迷迭香',
                    actions: [{
                      type: 'message',
                      label: '薄荷',
                      text: '薄荷'
                    }, {
                      type: 'message',
                      label: '迷迭香',
                      text: '迷迭香'
                    }]
                  }, {
                    thumbnailImageUrl: 'https://mmbiz.qpic.cn/mmbiz_jpg/7xdDOnvI6TjZY3SmWIZh6YWbII9ibpldk3syNPO6tjNwlYZIfZRmgE4ib2RZlWLpkvM2GEfHE4kxgYpuDShnahSg/640?wx_fmt=jpeg',
                    title: '大型室内植物',
                    text: '許多大型室內植物天生對生存環境接受度非常廣，如橡皮樹, 發財樹',
                    actions: [{
                      type: 'message',
                      label: '橡皮樹',
                      text: '橡皮樹'
                    }, {
                      type: 'message',
                      label: '發財樹',
                      text: '發財樹'
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
                  text: '現在自動澆水功能都設定好嘍！！每週都會幫你推送我的健康數據，接下來你可以',
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
                  ref_pt.once('value')
                    .then(function(snapshot) {
                      let p_type = snapshot.val();
                      switch(p_type) {
                        case '虎尾蘭':
                          event.reply('虎尾蘭');
                          break;
                        case '仙人掌':
                          event.reply('仙人掌');
                          break;
                        case '黃金葛':
                          event.reply('黃金葛');
                          break;
                        case '合果芋':
                          event.reply('合果芋');
                          break;
                        case '茉莉花':
                          event.reply('茉莉花');
                          break;
                        case '百合花':
                          event.reply('百合花');
                          break;
                        case '薄荷':
                          event.reply('薄荷');
                          break;
                        case '迷迭香':
                          event.reply('迷迭香');
                          break;
                        case '橡皮樹':
                          event.reply('橡皮樹');
                          break;
                        case '發財樹':
                          event.reply('發財樹'); 
                          break;
                        default:
                          event.reply('現在還沒有支援這種植物喔！抱歉');                       
                      }
                    })
                  break;
                case '重設' :
                  step = -1
                  event.reply('你好!!歡迎來到plantRobot!!第一次設定需要輸入webduino裝置的ID才可以讓我順利上網歐！!！')
                  break;
                case 'today' :
                  event.reply(`${today.getFullYear()}-${today.getMonth()+1}-${today.getDate()}`)
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
    schedule.scheduleJob('30 56 * * * *',()=>{
      let dht_tot = 0;
      let temperature_tot = 0;
      let humidity_tot = 0;
      plant_ref.once('value')
        .then(function(snapshot){
          snapshot.forEach(function (childSnapshot){
            let each_id = childSnapshot.key
            let new_plant_ref = firebase.database().ref(`/plant_condition/${each_id}/${today.getFullYear()}-${today.getMonth()+1}-${today.getDate()}`)
            let new_evo_ref = firebase.database().ref(`/environment_condition/${each_id}/${today.getFullYear()}-${today.getMonth()+1}-${today.getDate()}`)
            new_plant_ref.once('value')
              .then(function(snapshot) {
                snapshot.forEach(function (childSnapshot) {
                  let dht = childSnapshot.child("dht").val()
                  dht_tot += dht 
                })
              })
            new_evo_ref.once('value')
              .then(function(snapshot){
                snapshot.forEach(function (childSnapshot) {
                  let c_humidity = childSnapshot.child("humidity").val()
                  let c_temperature = childSnapshot.child("emperature").val()
                  humidity_tot += c_humidity
                  temperature_tot += c_temperature
          
                })
              })
            if(dht_tot + 40 >= 70 && temperature_tot > 15 && humidity_tot > 15){
              console.log(dht_tot)
              bot.push(each_id, `狀況極佳！請繼續保持喔！今天我的平均溫度是${temperature_tot}, 濕度是${humidity_tot}, 總體溫濕度指標為${dht_tot + 40}分，符合標準`)
            }
            else if(dht_tot/2 + 40 > 40 && dht_tot/2 + 40 < 70 && temperature_tot/2 > 15 && humidity_tot/2 > 15){
              bot.push(each_id, `狀況普通！可以上我們的網站獲取植物冷知識，讓我變的更健康！今天我的平均溫度是${temperature_tot/2}, 濕度是${humidity_tot/2}, 總體溫濕度指標為${dht_tot/2 + 40}分，符合標準`)
            } 
            else {
              console.log(dht_tot)
              bot.push(each_id, `狀況不太好欸！可以上我們的網站獲取植物冷知識，加油吧！今天我的平均溫度是${temperature_tot/2}, 濕度是${humidity_tot/2}, 總體溫濕度指標為${dht_tot/2 + 40}分，不符合標準`)
            }

            dht_tot = 0;
            humidity_tot = 0;
            temperature_tot = 0;
          })
        })
      


      // line_id_ref.once('value')
      //   .then(function(snapshot){
      //     snapshot.forEach(function(childSnapshot){
      //       let each_id = childSnapshot.key
      //       let each_plant_type = firebase.database().ref(`user_device/${each_id}/plantType`)
      //       each_plant_type.once('value')
      //         .then(function(snapshot){
      //           let p_type = snapshot.val()
      //           if(mini.includes(p_type)) { 
      //             bot.push(each_id, '多肉植物')                 
      //           } 
      //           else if(mini_a.includes(p_type)){
      //             bot.push(each_id, '芋科室內植物')
      //           }
      //           else if(large.includes(p_type)){
      //             bot.push(each_id, '香花植物')
      //           }
      //           else if(large_a.includes(p_type)){
      //             bot.push(each_id, '香草植物')
      //           }
      //           else if(large_b.includes(p_type)){
      //             bot.push(each_id, '大型室内植物')
      //           }
      //           else {
      //             bot.push(each_id, '????')
      //           }
      //         })
      
      //     })  
      //   })
    }); 
}

// const  scheduleCronstyle_water_notice = ()=>{
//   schedule.scheduleJob('30 58 * * * *',()=>{
    
//   })
// }



scheduleCronstyle();