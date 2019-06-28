# vue3.3

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### 平台项目地址配置
    文件路径： src/utils/BaseICL.ts
    BaseUri: "http://192.168.1.6:9999/jd",          //项目路径
    COMM_FLD_VALUE_DBID: "ZT1",                     //数据库标识

    MQTT_SERVICE : 'ws://IP:端口/ws',     //rabbitMQ地址
    MQTT_USERNAME:'username',                          //用户名
    MQTT_PASSWORD:'password',                          //密码
    MQTT_HOST:'bipmq',                              //HOST


### Compiles and minifies for production
```
npm run build
```

### Run your tests
```
npm run test
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
