const config = [
  {
    type:'output',
    label: '只允许输出',
    name:'输出',
    "data": [{
      "label": '输出配置1',
      "value":''
    },{
      "label": '输出配置1',
      "value":''
    },{
      "label": '输出配置1',
      "value":''
    }]
  },

  {
    type:'database',
    label: '数据库',
    name:'mySql',
    status:'logo',
    "data": [{
      "label": '数据库类型',
      "value":"mysql"
    },
    {
      "label": '配置1',
      "value":"aaa"
    },
    {
      "label": '配置2',
      "value":"bbb"
    }
  ]
  },
  {
    type:'onlyIn',
    label: '只允许输入',
    name:'只允许输入',
    "data": [{
      "label": '输入配置1',
      "value":''
    },{
      "label": '输入配置1',
      "value":''
    },{
      "label": '输入配置1',
      "value":''
    }]
  },
  {
    type:'condition',
    label: '条件',
    name:'条件',
    "data": [{
      "label": '条件配置1',
      "value":''
    },{
      "label": '条件配置1',
      "value":''
    },{
      "label": '条件配置1',
      "value":''
    }]
  }
]

export default config
