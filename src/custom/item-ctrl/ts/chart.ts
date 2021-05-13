export namespace ChartConfig {
    class ConfigUtils {
        getPie3D() {
            let leftT1Con = {
                colors: [
                    "#0f56ea",
                    "#1fc4f4",
                    "#f5dc30",
                    "#ff9110",
                    "#f8224a",
                    "#f92598",
                    "#c31ced",
                    "#621bf1",
                    "#2ff0ce",
                    "#18e47d",
                    "#b5f813",
                    "#f8492d",
                    "#2b3de7",
                ],
                chart: {
                    type: 'pie',
                    options3d: {
                        enabled: true,
                        alpha: 60,
                        beta: 0
                    },
                    backgroundColor: 'rgba(0,0,0,0)',

                },
                credits: {
                    enabled: false // 禁用版权信息
                },
                title: {
                    text: ''
                },
                tooltip: {
                    headerFormat: '',
                    pointFormat: '{point.name}: <b>{point.y}</b>',
                    valueSuffix: '亿元',
                    valueDecimals: 2,
                },
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        depth: 20,
                        size: "68%",
                        dataLabels: {
                            enabled: true,
                            textOutline: "none",
                            formatter: function () {
                                let _this: any = this;
                                return '<div><p style="color:' + _this.color + ';font-family:Arial,Helvetica,sans-serif;font-size:12px;">' + _this.point.name + '：' + (_this.percentage).toFixed(1) + '%</p></div>';
                            },
                            style: {
                                textOutline: 'none'
                            }
                        }
                    }
                },
                series: [{
                    type: 'pie',
                    data: [],
                    point: {
                        events: {
                            click: function (e: any) {
                            }
                        }
                    }
                }]
            }
            return leftT1Con;
        }
        getArea() {
            let rightB1Con = {
                color: [
                    "#155dff",
                    "#0ef6a7",
                    "#ffe535",
                    "#19f1ff",
                    "#1860f4",
                    "#1fc4f4",
                    "#f5dc30",
                    "#ff9110",
                    "#f8224a",
                    "#f92598",
                ],
                tooltip: {
                    formatter: '{b0}: {c0}(亿)',
                },
                legend: {
                    icon: 'rectangle',
                    data: [],
                    textStyle: {
                        fontSize: 10,
                        color: '#666'
                    }
                },
                grid: {
                    left: "20px",
                    top: "20px",
                    right: "20px",
                    bottom: "4%",
                    containLabel: true,
                },
                xAxis: [
                    {
                        type: 'category',
                        boundaryGap: false,
                        data: [],
                        axisTick: {
                            alignWithLabel: true
                        },
                        axisLabel: {
                            textStyle: {
                                color: "#fff",
                                fontSize: "10"
                            },
                            interval:0,
                            rotate:40,
                        },
                        axisLine: {
                            show: false
                        }
                    }
                ],
                yAxis: [
                    {
                        type: "value",
                        axisLabel: {
                            textStyle: {
                                color: "rgba(255,255,255,.6)",
                                fontSize: "12",
                            },
                        },
                        axisLine: {
                            lineStyle: {
                                color: "rgba(255,255,255,.1)",
                            },
                        },
                        splitLine: {
                            lineStyle: {
                                color: "rgba(255,255,255,.1)",
                            },
                        },
                    },
                ],
                series: [],
            };
            return rightB1Con;
        }
        getColumn() {
            let leftB1Con = {
                color: ["#2f89cf"],
                tooltip: {
                    // pointFormat: '{point.name}: <b>{point.y}</b>',
                    formatter: function (params: any) {
                        if (params.data) {
                            if (params.data.message)
                                return params.data.message;
                        } else {
                            let d1 = params[0];
                            return d1.name + ":" + d1.value+"(亿)-" +d1.data.bl+"%";
                        }
                    },
                    trigger: "axis",
                    axisPointer: {
                        // 坐标轴指示器，坐标轴触发有效
                        type: "shadow", // 默认为直线，可选为：'line' | 'shadow'
                    },
                },
                grid: {
                    left: "20px",
                    top: "20px",
                    right: "20px",
                    bottom: "4%",
                    containLabel: true,
                },
                xAxis: [
                    {
                        type: "category",
                        data: [],
                        axisTick: {
                            alignWithLabel: true,
                        },
                        axisLabel: {
                            textStyle: {
                                color: "#fff",
                                fontSize: "10",
                            },
                            interval:0,
                            rotate:40,
                        },
                        axisLine: {
                            show: false,
                        },
                    },
                ],
                yAxis: [
                    {
                        type: "value",
                        axisLabel: {
                            textStyle: {
                                color: "rgba(255,255,255,.6)",
                                fontSize: "12",
                            },
                        },
                        axisLine: {
                            lineStyle: {
                                color: "rgba(255,255,255,.1)",
                                // width: 1,
                                // type: "solid"
                            },
                        },
                        splitLine: {
                            lineStyle: {
                                color: "rgba(255,255,255,.1)",
                            },
                        },
                    },
                ],
                series: [
                    {
                        name: "",
                        type: "bar",
                        barWidth: "35%",
                        data: [],
                        itemStyle: {
                            barBorderRadius: 5,
                        },// 基准线
                    },
                ],
            };
            return leftB1Con;
        }
        getMap1() {
            let mapCon = {
                color: [
                    "#3580ed",
                    "#32b4ed",
                    "#F43749",
                    "#ff971a",
                    "#bfff43",
                    "#3ae8c6",
                    "#603de0",
                    "#06c8ab",
                    "#d156ef",
                    "#ffe266",
                    "#18d186",
                    "#066eab",
                    "#0682ab",
                    "#0696ab",
                    "#06a0ab",
                    "#06b4ab",
                ],
                title: {
                    text: "",
                    subtext: "",
                    left: "center",
                    textStyle: {
                        color: "#7bbfea",
                    },
                },
                geo: {
                    map: "china",
                    label: {
                        show: true,
                        emphasis: {
                            show: true,
                            color: "#fff",
                        },
                    },
                    roam: false,
                    itemStyle: {
                        normal: {
                            borderWidth: 0,
                            shadowColor: 'rgb(255,255,255,0.7)',
                            shadowOffsetX: 7,
                            shadowOffsetY: 8
                        },
                        emphasis: {
                            areaColor: "#2B91B7"
                        }
                    },
                    regions: [{
                        name: '南海诸岛',
                        itemStyle: {
                            areaColor: 'rgba(0, 10, 52, 1)',
                            borderColor: 'rgba(0, 10, 52, 1)',
                            normal: {
                                opacity: 0,
                                label: {
                                    show: false,
                                    color: "#009cc9",
                                }
                            }
                        },
                    }],
                },
                // 提示框，鼠标移入
                tooltip: {
                    show: true, //鼠标移入是否触发数据
                    trigger: "item", //出发方式
                    // formatter: "{b}-公司数量：{c}",
                    formatter: function (params: any) {
                        if (params.data) {
                            return params.data.message;
                        } else {
                            return "";
                        }
                    }
                },
                //配置地图的数据，并且显示
                series: [
                    {
                        type: 'map',
                        roam: false,
                        label: {
                            normal: {
                                show: true,
                                textStyle: {
                                    color: '#000000'
                                }
                            },
                            emphasis: {
                                textStyle: {
                                    color: 'rgb(183,185,14)'
                                }
                            }
                        },
                        // itemStyle:{
                        //     areaColor : '#1A4888'
                        // },
                        data: [
                            { name: '黑龙江', itemStyle: { areaColor: '#3580ed', color: '#3580ed', borderWidth: 0 }, message: "" },
                            { name: '吉林', itemStyle: { areaColor: '#32b4ed', color: '#32b4ed', borderWidth: 0 }, message: "" },
                            { name: '内蒙古', itemStyle: { areaColor: '#32b4ed', color: '#32b4ed', borderWidth: 0 }, message: "" },
                            { name: '辽宁', itemStyle: { areaColor: '#32b4ed', color: '#32b4ed', borderWidth: 0 }, message: "" },
                            { name: '北京', itemStyle: { areaColor: '#F43749', color: '#F43749', borderWidth: 0 }, message: "" },
                            { name: '天津', itemStyle: { areaColor: '#F43749', color: '#F43749', borderWidth: 0 }, message: "" },
                            { name: '河北', itemStyle: { areaColor: '#F43749', color: '#F43749', borderWidth: 0 }, message: "" },
                            { name: '山西', itemStyle: { areaColor: '#F43749', color: '#F43749', borderWidth: 0 }, message: "" },
                            { name: '山东', itemStyle: { areaColor: '#ff971a', color: '#ff971a', borderWidth: 0 }, message: "" },
                            { name: '河南', itemStyle: { areaColor: '#ff971a', color: '#ff971a', borderWidth: 0 }, message: "" },
                            { name: '重庆', itemStyle: { areaColor: '#ff971a', color: '#ff971a', borderWidth: 0 }, message: "" },
                            { name: '江苏', itemStyle: { areaColor: '#bfff43', color: '#bfff43', borderWidth: 0 }, message: "" },
                            { name: '安徽', itemStyle: { areaColor: '#bfff43', color: '#bfff43', borderWidth: 0 }, message: "" },
                            { name: '浙江', itemStyle: { areaColor: '#3ae8c6', color: '#3ae8c6', borderWidth: 0 }, message: "" },
                            { name: '上海', itemStyle: { areaColor: '#3ae8c6', color: '#3ae8c6', borderWidth: 0 }, message: "" },
                            { name: '福建', itemStyle: { areaColor: '#3ae8c6', color: '#3ae8c6', borderWidth: 0 }, message: "" },
                            { name: '江西', itemStyle: { areaColor: '#3ae8c6', color: '#3ae8c6', borderWidth: 0 }, message: "" },
                            { name: '广东', itemStyle: { areaColor: '#603de0', color: '#603de0', borderWidth: 0 }, message: "" },
                            { name: '广西', itemStyle: { areaColor: '#603de0', color: '#603de0', borderWidth: 0 }, message: "" },
                            { name: '海南', itemStyle: { areaColor: '#603de0', color: '#603de0', borderWidth: 0 }, message: "" },
                            { name: '云南', itemStyle: { areaColor: '#d156ef', color: '#d156ef', borderWidth: 0 }, message: "" },
                            { name: '贵州', itemStyle: { areaColor: '#d156ef', color: '#d156ef', borderWidth: 0 }, message: "" },
                            { name: '湖南', itemStyle: { areaColor: '#d156ef', color: '#d156ef', borderWidth: 0 }, message: "" },
                            { name: '湖北', itemStyle: { areaColor: '#ffe266', color: '#ffe266', borderWidth: 0 }, message: "" },
                            { name: '陕西', itemStyle: { areaColor: '#ffe266', color: '#ffe266', borderWidth: 0 }, message: "" },
                            { name: '新疆', itemStyle: { areaColor: '#18d186', color: '#18d186', borderWidth: 0 }, message: "" },
                            { name: '青海', itemStyle: { areaColor: '#f75e34', color: '#f75e34', borderWidth: 0 }, message: "" },
                            { name: '宁夏', itemStyle: { areaColor: '#f75e34', color: '#f75e34', borderWidth: 0 }, message: "" },
                            { name: '甘肃', itemStyle: { areaColor: '#f75e34', color: '#f75e34', borderWidth: 0 }, message: "" },
                            { name: '四川', itemStyle: { areaColor: '#f75e34', color: '#f75e34', borderWidth: 0 }, message: "" },

                            // { name: '黑龙江',message:""},
                            // { name: '吉林',message:""},
                            // { name: '内蒙古',message:""},
                            // { name: '辽宁',message:""},
                            // { name: '北京',message:""},
                            // { name: '天津',message:""},
                            // { name: '河北',message:""},
                            // { name: '山西',message:""},
                            // { name: '山东',message:""},
                            // { name: '河南',message:""},
                            // { name: '重庆',message:""},
                            // { name: '江苏',message:""},
                            // { name: '安徽',message:""},
                            // { name: '浙江',message:""},
                            // { name: '上海',message:""},
                            // { name: '福建',message:""},
                            // { name: '江西',message:""},
                            // { name: '广东',message:""},
                            // { name: '广西',message:""},
                            // { name: '海南',message:""},
                            // { name: '云南',message:""},
                            // { name: '贵州',message:""},
                            // { name: '湖南',message:""},
                            // { name: '湖北',message:""},
                            // { name: '陕西',message:""},
                            // { name: '新疆',message:""},
                            // { name: '青海',message:""},
                            // { name: '宁夏',message:""},
                            // { name: '甘肃',message:""},
                            // { name: '四川',message:""},

                        ],
                        map: 'china'
                    },
                    {
                        type: "effectScatter",
                        showEffectOn: "render", //配置什么时候显示特效
                        coordinateSystem: "geo", //该系列使用的坐标系
                        symbolSize: 10, //标记的大小
                        rippleEffect: {              //涟漪特效相关配置。
                            period: 1.2,               //动画的时间。
                            scale: 3.5,              //动画中波纹的最大缩放比例。
                            brushType: 'fill',
                        },
                        data: []
                    },
                ]
            };
            return mapCon;
        }
        getMap() {
            let mapCon = {
                // 提示框，鼠标移入
                tooltip: {
                    show: true, //鼠标移入是否触发数据
                    trigger: "item", //出发方式
                    position: { left: '8%', bottom: "-6%" },
                    backgroundColor: 'rgba(255,255,255,0)',
                    // formatter: "{b}-公司数量：{c}",
                    formatter: function (params: any) {
                        if (params.data) {
                            return params.data.message;
                        } else {
                            return "";
                        }
                    },
                    axisPointer: {
                        animation: false
                    }
                },
                geo: {
                    map: 'china',
                    show: true,
                    roam: false,
                    zoom: 1.2,
                    label: {
                        emphasis: {
                            show: false
                        }
                    },
                    layoutSize: "100%",
                },
                series: [{
                    type: 'map',
                    map: 'china',
                    aspectScale: 0.75,
                    zoom: 1.2,
                    label: {
                        normal: {
                            show: false,
                        },
                        emphasis: {
                            show: false,
                        }
                    },
                    itemStyle: {
                        normal: {
                            areaColor: {
                                x: 0,
                                y: 0,
                                x2: 0,
                                y2: 1,
                                colorStops: [{
                                    offset: 0,
                                    color: '#0E173C' // 0% 处的颜色
                                }, {
                                    offset: 1,
                                    color: '#0E173C' // 100% 处的颜色
                                }],
                            },
                            borderColor: '#259CE7',
                            borderWidth: 3,
                        },
                        emphasis: {
                            areaColor: {
                                x: 0,
                                y: 0,
                                x2: 0,
                                y2: 1,
                                colorStops: [{
                                    offset: 0,
                                    color: '#0E173C' // 0% 处的颜色
                                }, {
                                    offset: 1,
                                    color: '#0E173C' // 100% 处的颜色
                                }],
                            },
                        }
                    },
                    data: [
                        { name: '黑龙江', message: "" },
                        { name: '吉林', message: "" },
                        { name: '内蒙古', message: "" },
                        { name: '辽宁', message: "" },
                        { name: '北京', message: "" },
                        { name: '天津', message: "" },
                        { name: '河北', message: "" },
                        { name: '山西', message: "" },
                        { name: '山东', message: "" },
                        { name: '河南', message: "" },
                        { name: '重庆', message: "" },
                        { name: '江苏', message: "" },
                        { name: '安徽', message: "" },
                        { name: '浙江', message: "" },
                        { name: '上海', message: "" },
                        { name: '福建', message: "" },
                        { name: '江西', message: "" },
                        { name: '广东', message: "" },
                        { name: '广西', message: "" },
                        { name: '海南', message: "" },
                        { name: '云南', message: "" },
                        { name: '贵州', message: "" },
                        { name: '湖南', message: "" },
                        { name: '湖北', message: "" },
                        { name: '陕西', message: "" },
                        { name: '新疆', message: "" },
                        { name: '青海', message: "" },
                        { name: '宁夏', message: "" },
                        { name: '甘肃', message: "" },
                        { name: '四川', message: "" },
                    ],
                },
                {
                    type: "effectScatter",
                    showEffectOn: "render", //配置什么时候显示特效
                    coordinateSystem: "geo", //该系列使用的坐标系
                    symbolSize: 10, //标记的大小
                    rippleEffect: {              //涟漪特效相关配置。
                        period: 1.2,               //动画的时间。
                        scale: 3.5,              //动画中波纹的最大缩放比例。
                        brushType: 'fill',
                    },
                    data: []
                }]
            };
            return mapCon;
        }
        getPictorialBar() {
            let option: any = {
                xAxis: {
                    data: [],
                    axisTick: {
                        show: false
                    },
                    axisLine:{
                        lineStyle:{
                            color:'#fff',
                            width:1,//这里是为了突出显示加上的
                        }
                    },
                    axisLabel: {
                        fontSize: 16,
                        padding:[10,0,0,0]
                    }
                },
                yAxis: [{
                    axisTick: {
                        show: false
                    },
                    splitArea: {
                        areaStyle: {
                            color: 'rgba(255,255,255,.5)'
                        }
                    },
                    axisLine:{
                        lineStyle:{
                            color:'#fff',
                            width:1,//这里是为了突出显示加上的
                        }
                    },
                    splitLine: {
                        show: false,
                        lineStyle: {
                            type: 'dashed',
                            width: 0.5,
                            color:'#fff'
                        }
                    },
                }
                ],
                tooltip: {
                    // pointFormat: '{point.name}: <b>{point.y}</b>',
                    formatter: function (params: any) {
                        if (params.data) {
                            return params.data.message;
                        } else {
                            return "";
                        }
                    }
                },
                series: [{
                    type: 'pictorialBar',
                    barCategoryGap: '0%',
                    symbol: 'path://M0,10 L10,10 C5.5,10 5.5,5 5,0 C4.5,5 4.5,10 0,10 z',
                    label: {
                        show: true,
                        position: 'top',
                        color: '#08DFFE',
                        fontSize: 12,
                        formatter: function (params: any) {
                            return  params.data.fcy + "(亿)-"+params.value + "%"
                        },
                    },
                    itemStyle: {
                        normal: {
                            color: {
                                type: 'linear',
                                x: 0,
                                y: 0,
                                x2: 0,
                                y2: 1,
                                colorStops: [{
                                    offset: 0,
                                    color: '#9A11FF'
                                },
                                {
                                    offset: 1,
                                    color: '#08DFFE'
                                }],
                                global: false //  缺省为  false
                            }
                        },
                        emphasis: {
                            opacity: 1
                        }
                    },
                    data: []
                }]
            };
            return option;
        }

        getBar3D() {
            let option = {
                xAxis: {
                    data: [],
                    axisLine:{
                        lineStyle:{
                            color:'#fff',
                            width:1,//这里是为了突出显示加上的
                        }
                    },
                    axisLabel: {
                        fontSize: 16,
                        padding:[10,0,0,0]
                    }
                },grid: {
                    left: "10%",
                    top: "10%",
                    right: "10%",
                    bottom: "20px",
                    containLabel: true,
                },
                tooltip: {
                    formatter: function (params: any) {
                        if (params.data) {
                            if (params.data.message)
                                return params.data.message;
                        } else {
                            let d1 = params[0];
                            return d1.name + ":" + d1.value;
                        }
                    },
                    trigger: "axis",
                    axisPointer: {
                        type: "shadow", 
                    },
                },
                yAxis: {
                    axisLine:{
                        lineStyle:{
                            color:'#fff',
                            width:1,//这里是为了突出显示加上的
                        }
                    },
                    splitLine: {
                        show: false,
                        lineStyle: {
                            type: 'dashed',
                            width: 0.5,
                            color:'#fff'
                        }
                    },
                },
                series: [{
                    type: 'bar',
                    barWidth: 37,
                    label: {
                        show: true,
                        position: 'top',
                        color: '#FFF',
                        fontSize: 12,
                    },
                    itemStyle: {
                        normal: {
                            barBorderRadius: 20,
                        },
                    },
                    data: []
                }, {
                    name: 'a',
                    tooltip: {
                        show: false
                    },
                    type: 'pictorialBar',
                    symbol: 'circle',
                    symbolSize: ['38', '22'],
                    symbolPosition: 'end',
                    data: [],
                    z: 3
                }, {
                    name: 'a',
                    tooltip: {
                        show: false
                    },
                    type: 'pictorialBar',
                    symbol: 'circle',
                    symbolSize: ['38', '22'],
                    data: [],
                    z: 3
                }
                ]
            };
            return option;
        }

    }
    export let Config = new ConfigUtils();
}
