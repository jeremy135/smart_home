// https://github.com/vakio-ru/vakio-public-api?tab=readme-ov-file#connect

createVakioOpenAir({
  id: 1, //Указываем уникальный идентификатор виртуального устройства
  topic: "VAKIO", //Указываем MQTT топик, который был указан при настройке подключения к MQTT серверу
  polling_interval: 3, //Указываем период опроса наличия соединения с рекуператором в секундах
});

function createVakioOpenAir(params) {
  //Создаем функцию
  var id = params.id; //В переменную id передаем значение параметра id
  var topic = params.topic; //В переменную topic передаем значение параметра topic
  var polling_interval =
    params.polling_interval == undefined ? 3 : params.polling_interval; //Если параметр polling_interval объявлен, то передаем его в переменную polling_interval, в ином случае в переменную передаем "3"

  var nameVirtualDevice = "Vakio_{}".format(id); //Формируем наш DevName (device name)

  var mqttTopicState = "State"; // on off
  var mqttTopicWorkmode = "Workmode"; // manual | super_auto
  var mqttTopicSpeed = "Speed"; // 0 - 5
  var mqttTopicGate = "Gate"; // 1 - 4
  var mqttTopicTemp = "Temperature"; //  20
  var mqttTopicHud = "Humidity"; // 33

  defineVirtualDevice(nameVirtualDevice, {
    title: "Vakio Open Air {}".format(nameVirtualDevice),
    cells: {},
  });

  getDevice(nameVirtualDevice).addControl(mqttTopicState, {
    type: "switch",
    order: 0,
    value: false,
  });
  // manual | super_auto
  getDevice(nameVirtualDevice).addControl(mqttTopicWorkmode, {
    type: "switch",
    order: 1,
    value: false,
  });
  // Done
  getDevice(nameVirtualDevice).addControl(mqttTopicSpeed, {
    type: "range",
    order: 2,
    min: 1,
    max: 5,
    value: 0,
  });
  getDevice(nameVirtualDevice).addControl(mqttTopicGate, {
    type: "range",
    order: 2,
    min: 1,
    max: 4,
    value: 1,
  });
  getDevice(nameVirtualDevice).addControl(mqttTopicTemp, {
    type: "text",
    order: 3,
    readonly: true,
    value: "Loading",
  });
  getDevice(nameVirtualDevice).addControl(mqttTopicHud, {
    type: "text",
    order: 3,
    readonly: true,
    value: "Loading",
  });

  function sendTranslate(controlTopic, meta) {
    publish(
      "/devices/{}/controls/{}/meta".format(nameVirtualDevice, controlTopic),
      meta,
      2,
      true
    );
  }

  sendTranslate(
    mqttTopicState,
    '{"type": "switch","order":"0","readonly":0,"title":{"ru": "Состояние"}}'
  );
  sendTranslate(
    mqttTopicWorkmode,
    '{"type": "switch","order":"1","readonly":0,"title":{"ru": "Режим работы - авто"}}'
  );
  sendTranslate(
    mqttTopicSpeed,
    '{"type": "range","order":"2","max":"5","readonly":0,"title":{"ru": "Скорость"}}'
  );
  sendTranslate(
    mqttTopicGate,
    '{"type": "range","order":"2","max":"4","readonly":0,"title":{"ru": "Позиция заслонки"}}'
  );
  sendTranslate(
    mqttTopicTemp,
    '{"type": "text","order":"2","readonly":1,"title":{"ru": "Температура"}}'
  );
  sendTranslate(
    mqttTopicHud,
    '{"type": "text","order":"2","readonly":1,"title":{"ru": "Влажность"}}'
  );

  function publishMqtt(subtopic, value) {
    publish("{}/{}".format(topic, subtopic), value, 2, true);
  }
  // subscribe to state from wirenboard UI/MQTT
  trackMqtt(
    "/devices/{}/controls/{}/on".format(nameVirtualDevice, mqttTopicState),
    function (message) {
      var state;
      state = message.value == true ? "on" : "off";
      publishMqtt("state", state);
      if (!dev[mqttTopicSpeed]) {
        publish(
          "/devices/{}/controls/{}".format(nameVirtualDevice, mqttTopicSpeed),
          1,
          2,
          true
        );
      }
    }
  );
  // subscribe VAKIO state
  trackMqtt("{}/state".format(topic), function (message) {
    var stateReal = message.value == "on" ? 1 : 0;
    publish(
      "/devices/{}/controls/{}".format(nameVirtualDevice, mqttTopicState),
      stateReal,
      2,
      true
    );
  });
  // subscribe wirenbord ui/mqtt for workmode
  trackMqtt(
    "/devices/{}/controls/{}/on".format(nameVirtualDevice, mqttTopicSpeed),
    function (message) {
      if (message.value === true) {
        publishMqtt("workmode", "super_auto");
      } else if (message.value === false) {
        publishMqtt("workmode", "manual");
      }
    }
  );
  // subscribe VAKIO workmode
  trackMqtt("{}/workmode".format(topic), function (message) {
    //log.info("/workmode name: {}, value: {}".format(message.topic, message.value));
    
    switch (message.value) {
      case "manual":
        publish(
          "/devices/{}/controls/{}".format(
            nameVirtualDevice,
            mqttTopicWorkmode
          ),
          false,
          2,
          true
        );
        break;
      case "super_auto":
        publish(
          "/devices/{}/controls/{}".format(
            nameVirtualDevice,
            mqttTopicWorkmode
          ),
          true,
          2,
          true
        );
        break;
    }
  });
  // subscribe wirenbord ui/mqtt for speed
  trackMqtt(
    "/devices/{}/controls/{}/on".format(nameVirtualDevice, mqttTopicSpeed),
    function (message) {
      publishMqtt("speed", message.value);
    }
  );
  // subscribe VAKIO speed
  trackMqtt("{}/speed".format(topic), function (message) {
    publish(
      "/devices/{}/controls/{}".format(nameVirtualDevice, mqttTopicSpeed),
      parseInt(message.value, 10),
      2,
      true
    );
  });

  // subscribe wirenbord ui/mqtt for gate
  trackMqtt(
    "/devices/{}/controls/{}/on".format(nameVirtualDevice, mqttTopicGate),
    function (message) {
      publishMqtt("gate", message.value);
    }
  );
  // subscribe VAKIO gate
  trackMqtt("{}/gate".format(topic), function (message) {
    publish(
      "/devices/{}/controls/{}".format(nameVirtualDevice, mqttTopicGate),
      parseInt(message.value, 10),
      2,
      true
    );
  });

  // subscribe VAKIO temp
  trackMqtt("{}/temp".format(topic), function (message) {
    publish(
      "/devices/{}/controls/{}".format(nameVirtualDevice, mqttTopicTemp),
      parseInt(message.value, 10),
      2,
      true
    );
  });
  // subscribe VAKIO hud
  trackMqtt("{}/hud".format(topic), function (message) {
    publish(
      "/devices/{}/controls/{}".format(nameVirtualDevice, mqttTopicHud),
      parseInt(message.value, 10),
      2,
      true
    );
  });
}
