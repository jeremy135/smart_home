// current temp
var KNXTempValue = "1.1.11/Value";
// set temp
var KNXTempSet = "1.1.10/SetpointState";
// switch state sauna
var KNXSwitchState = "1.1.13/SwitchState";
// main switch
var KNXMainSwitchState = "1.1.16/SwitchState";
// virtual device name
var faselDeviceName = "fasel-heater";

// sync heater -> wb
defineRule("CurrentTemperature", {
  whenChanged: KNXTempValue, //при изменении переключателя
  then: function (newValue, devName, cellName) {
    //выполняй следующие действия
    log.info(
      "Устройство",
      devName,
      "контрол",
      cellName,
      "новое значение",
      newValue
    );
    dev[faselDeviceName+"/temp"] = newValue;
  },
});

// sync heater -> wb
defineRule("SetPointTemperature", {
  whenChanged: KNXTempSet, //при изменении переключателя
  then: function (newValue, devName, cellName) {
    //выполняй следующие действия
    log.info(
      "Устройство",
      devName,
      "контрол",
      cellName,
      "новое значение",
      newValue
    );
    dev[faselDeviceName+"/settemp"] = newValue;
  },
});

// sync heater -> wb
defineRule("SwitchState", {
  whenChanged: KNXSwitchState, //при изменении переключателя
  then: function (newValue, devName, cellName) {
    //выполняй следующие действия
    log.info(
      "Устройство",
      devName,
      "контрол",
      cellName,
      "новое значение",
      newValue
    );
    dev[faselDeviceName+"/enabled"] = newValue;
  },
});

// virtual device
defineVirtualDevice(faselDeviceName, {
  title: { en: "Heater", ru: "Каменка" },
  cells: {
    temp: {
      title: { en: "Temperature", ru: "Температура" },
      type: "value",
      value: 0,
    },
    settemp: {
      title: { en: "Temperature setpoint", ru: "Выставленная температура" },
      type: "value",
      value: 0,
    },
    enabled: {
        title: { en: "Heat", ru: "Нагрев" },
	    type: "switch",
	    value: false
	},
  },
});

