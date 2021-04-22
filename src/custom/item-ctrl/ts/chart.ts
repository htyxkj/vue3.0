 export namespace ChartConfig {
  class ConfigUtils {
    getPie3D(){
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
                    backgroundColor: 'rgba(0,0,0,0)'
            },
            credits:{
                enabled: false // 禁用版权信息
            },
            title: {
                text: ''
            },
            tooltip: {
                pointFormat: '{point.name}: <b>{point.y}</b>'
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    depth: 55,
                    size:140,
                    dataLabels: {
                        enabled: true, 
                        textOutline:"none",
                        formatter:function(){ 
                            let _this:any = this;
                            return  '<div><p style="color:'+ _this.color+';font-family:Arial,Helvetica,sans-serif;font-size:12px;">'+ _this.point.name +'：'+ (_this.percentage).toFixed(1)+'%</p></div>';
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
                    click: function (e:any) {
                    }
                }
                }
            }]
        }
        return leftT1Con;
    }
  }
  export let Config = new ConfigUtils();
}
