# Шаблон wirenboard 7 для modbus устройства

Датчик температуры, влажности, CO2, TVOC 

https://item.taobao.com/item.htm?spm=a21n57.1.0.0.30bd523cugZ9fm&id=587282807031&ns=1&abbucket=19#detail

В папке так же картинки с регистрами устройства


## Как использовать 

1. Скопировать в папку /etc/wb-mqtt-serial.conf.d/template

2. Перезапустить сервис 
```
systemctl restart wb-mqtt-serial
```
3. Шаблон появился в списке шаблонов устройств

## Команды для modbus_client
получить температуру:

```
modbus_client -mrtu -pnone -s1 -b9600 /dev/ttyRS485-1 -a 1 -t3 -r 0 -c 1 --debug
```


получить влажность:
```
modbus_client -mrtu -pnone -s1 -b9600 /dev/ttyRS485-1 -a 1 -t3 -r 1 -c 1 --debug

```

получить CO2:
```
modbus_client -mrtu -pnone -s1 -b9600 /dev/ttyRS485-1 -a 1 -t3 -r 6 -c 1 --debug
```

получить TVOC:
```
modbus_client -mrtu -pnone -s1 -b9600 /dev/ttyRS485-1 -a 1 -t3 -r 7 -c 1 --debug
```
