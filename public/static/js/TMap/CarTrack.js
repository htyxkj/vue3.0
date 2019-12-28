/****
 * 依赖于天地图的D3.js支持库，以SVG的形式对车辆行驶位置及轨迹进行实时跟踪和动态展示。
 * 实现车辆沿路线运动，并有暂停等功能。
 * 注：chrome、safari、IE9及以上浏览器。
 * @author juyang
 * ****/

/**
 * 车辆的图片，包含坐标和旋转相关方法
 */
var CarOverlay = T.Overlay.extend({
    initialize: function(lnglat, options) {
        this.lnglat = lnglat;
        this.setOptions(options);
        this.options = options;
    },

    onAdd: function(map) {
        this.map = map;
        var div = this.div = document.createElement("div");
        var img = this.img = document.createElement("img");
        div.style.position = "absolute";
        div.style.width = this.options.width + "px";
        div.style.height = this.options.height + "px";
        div.style.marginLeft = -this.options.width / 2 + 'px';
        div.style.marginTop = -this.options.height / 2 + 'px';
        div.style.zIndex = 200; // this._container.style.zIndex = zIndex;
        img.style.width = this.options.width + "px";
        img.style.height = this.options.height + "px";
        img.src = this.options.iconUrl;
        div.appendChild(img);
        map.getPanes().overlayPane.appendChild(this.div);
        this.update(this.lnglat);
    },

    onRemove: function() {
        var parent = this.div.parentNode;
        if (parent) {
            parent.removeChild(this.div);
            this.map = null;
            this.div = null;
        }
    },

    /**
     * 每个浏览器的偏转兼容
     * @returns {string}
     * @constructor
     */
    CSS_TRANSFORM: function() {
        var div = document.createElement('div');
        var props = [
            'transform',
            'WebkitTransform',
            'MozTransform',
            'OTransform',
            'msTransform'
        ];

        for (var i = 0; i < props.length; i++) {
            var prop = props[i];
            if (div.style[prop] !== undefined) {
                return prop;
            }
        }
        return props[0];
    },

    /**
     * 偏转角度
     * @param rotate
     */
    setRotate: function(rotate) {
        this.img.style[this.CSS_TRANSFORM()] = "rotate(" +
            rotate + "deg)";
    },

    setLnglat: function(lnglat) {
        this.lnglat = lnglat;
        this.update();
    },
    getLnglat: function() {
        return this.lnglat;
    },
    setPos: function(pos) {
        this.lnglat = this.map.layerPointToLngLat(pos)
        this.update();
    },
    /**
     * 更新位置
     */
    update: function() {
        var pos = this.map.lngLatToLayerPoint(this.lnglat);
        this.div.style.left = pos.x + "px";
        this.div.style.top = pos.y + "px";
    }


})

T.CarTrack = function(map, opt) {
    this.map = map;

    //  this.options = opt ? opt : {};
    //  this.options= this.setOptions(this.options,opt)
    //this.options.interval = this.options.interval ? this.options.interval : 1000;

    // this.options.uid = new Date().getTime();
    // this.uid = this.options.uid
    this.options.polylinestyle = this.setOptions(this.options.polylinestyle, opt.polylinestyle)
    this.options.carstyle = this.setOptions(this.options.carstyle, opt.carstyle)
    this.options = this.setOptions(this.options, opt)
    this.init();

}

T.CarTrack.prototype = {

    options: {

        interval: 1000,
        carstyle: {
            display: true,
            iconUrl: "http://211.144.37.205/air-super/inet/gimg/plane.png",
            width: 52,
            height: 26
        },
        polylinestyle: {
            display: true,
            color: "red",
            width: "3",
            opacity: 0.8,
            lineStyle: ""
        }
    },


    init: function() {
        var datas = this.options.Datas;
        this.options = this._deepCopy(this.options);
        this.options.uid = new Date().getTime();
        this.options.Datas = datas;
        if (this.options.speed > 0) {
            var dis = this.distance(this.options.Datas);
            this.options.nodeslength = dis / this.options.speed; //总步数；
        } else {
            this.options.nodeslength = this.options.Datas.length; //总步数；
        }
        //计步器
        this.options.Counter = 0;
        //new出D3的图层，等待数据


        this.D3OverLayer = new T.D3Overlay(this.d3init, this.d3redraw, this.options);
        this.D3OverLayer.lineDatas = []; //线数据
        //共享两个函数
        this.D3OverLayer.dataToLnglat = this.dataToLnglat;
        this.D3OverLayer.applyLatLngToLayer = this.applyLatLngToLayer;
        //this.D3OverLayer.updateSymbolLine = this.updateSymbolLine;
        //接收，处理数据，加载轨迹和车辆；
        this.receiveData(this.map);


    },

    setOptions: function(obj, options) {
        for (var i in options) {
            if (i != "polylinestyle" && i != "carstyle")
                obj[i] = options[i];
        }
        return obj;
    },
    /**
     *  清除所有元素，注销事件
     */
    clear: function() {
        this.state = 4;
        this._Remove();
        delete this;
    },

    _Remove: function() {
        this._pause();
        delete this._timer;
        this._timer = null;
        this.map.removeOverLay(this.carMarker);
        this.map.removeOverLay(this.D3OverLayer);
    },

    /**处理传入的数据**/
    receiveData: function() {
        var opt = this.options;
        var me = this;

        if (opt.Datas instanceof Array && opt.Datas.length > 0) {
            //绘制出D3渲染的线段；
            me.map.addOverLay(me.D3OverLayer)
                //绘制车辆
            me.carMarker = new CarOverlay(me.dataToLnglat(this.options.Datas[0]), me.options.carstyle);
            if (!this.options.carstyle)
                me.carMarker.hide();
            me.map.addOverLay(this.carMarker);

            me.D3OverLayer.bringToBack();
        }

    },
    /**
     * 坐标获取
     * @param obj
     * @returns {T.LngLat}
     */
    dataToLnglat: function(obj) {
        if (obj instanceof T.LngLat || ('lat' in obj && 'lng' in obj))
            return obj;
        else {
            var coordinates = obj.geometry.coordinates;
            var lnlat = new T.LngLat(coordinates[0], coordinates[1]);
            return lnlat;
        }


    },

    bind: function(fn, obj) {
        var slice = Array.prototype.slice;
        if (fn.bind) {
            return fn.bind.apply(fn, slice.call(arguments, 1));
        }
    },


    /**
     * 坐标转换
     * @param d
     * @returns {*}
     */
    applyLatLngToLayer: function(d) {

        return this.map.lngLatToLayerPoint(this.dataToLnglat(d));
    },

    d3init: function(sel, transform) {

        sel.append("path")
            .attr("id", "polyline" + this.options.uid)
            .attr("fill", "none")
            .attr("stroke", this.options.polylinestyle.color)
            .attr("width", this.options.polylinestyle.width)
            .attr('opacity', this.options.polylinestyle.opacity)
            .attr('display', this.options.polylinestyle.display ? "block" : "none")

        sel.append("path")
            .attr("id", "dynamicLine" + this.options.uid)
            .attr("fill", "none")
            .attr("stroke", this.options.polylinestyle.color)
            .attr("width", this.options.polylinestyle.width)
            .attr('opacity', this.options.polylinestyle.opacity)
            .attr('display', this.options.dynamicLine && this.options.polylinestyle.display ? "block" : "none")

    },


    d3redraw: function() {
        //像素点坐标转字符串
        function pointsToPath(rings, closed) {
            var str = '',
                i, j, len, len2, points, p;

            for (i = 0, len = rings.length; i < len; i++) {
                points = rings[i];

                for (j = 0, len2 = points.length; j < len2; j++) {
                    p = points[j];
                    str += (j ? 'L' : 'M') + p.x + ' ' + p.y;
                }

                // closes the ring for polygons; "x" is VML syntax
                str += closed ? (L.Browser.svg ? 'z' : 'x') : '';
            }

            // SVG complains about empty path strings
            return str || 'M0 0';
        }

        function lnglatsTopoints(map, lnglats) {
            var pts = [];
            for (var k = 0; k < lnglats.length; k++) {
                pts.push(map.lngLatToLayerPoint(lnglats[k]))
            }
            return pts;
        }
        var datasStr1 = pointsToPath([lnglatsTopoints(this.map, this.options.Datas)], false); //this._svg.
        var lineDatas = this.lineDatas ? this.lineDatas : this.D3OverLayer.lineDatas;
        var datasStr2 = pointsToPath([lnglatsTopoints(this.map, lineDatas)], false); //this.options.dynamicLine ? this.lineDatas : this.options.Datas;
        //线数据的重新计算分两种情况 1、缩放地图时要重新计算容器坐标 2、动态线的时候要重绘线
        d3.select("path#polyline" + this.options.uid).attr("d", datasStr1)
            .attr("stroke-width", this.options.polylinestyle.width + "px");

        d3.select("path#dynamicLine" + this.options.uid).attr("d", datasStr2)
            .attr("stroke-width", this.options.polylinestyle.width + "px");


    },


    /**
     * 随着时间
     */
    update: function() {
        //计步器+1
        this.options.Counter++
            var linePath = d3.select('path#polyline' + this.options.uid)
                .attr('display', this.options.polylinestyle.display && !this.options.dynamicLine ?
                    "block" : "none")
                //轨迹像素长度
        var nodeslength = (this.options.speed > 0 ?
            Math.ceil(this.options.nodeslength) + 1 :
            Math.ceil(this.options.nodeslength)
        )

        if (this.options.speed > 0) {
            //计算小车所在的像素点
            var l = linePath.node().getTotalLength();
            var s = (this.options.Counter - 1) / this.options.nodeslength
            var l1 = s * l;
            var p1 = linePath.node().getPointAtLength(l1);
            this.D3OverLayer.lineDatas = [];
            if (this.options.Datas[0])
                this.D3OverLayer.lineDatas.push(this.options.Datas[0]);
            var lsum = 0;
            // 计算像素点前的所有包含的轨迹坐标的像素点
            for (var k = 0; k < this.options.Datas.length - 1; k++) {
                var p2 = this.map.lngLatToLayerPoint(this.options.Datas[k]);
                var p3 = this.map.lngLatToLayerPoint(this.options.Datas[k + 1]);
                var l2 = p2.distanceTo(p3);
                lsum = lsum + l2;
                if (l1 > lsum)
                    this.D3OverLayer.lineDatas.push(this.options.Datas[k + 1]);
                else {
                    break;
                }
            }
            if (this.options.Counter < nodeslength) {
                var lnglat = this.map.layerPointToLngLat(p1)
                this.D3OverLayer.lineDatas.push(lnglat);
            }

        } else {
            this.D3OverLayer.lineDatas = this.options.Datas.slice(0, this.options.Counter);
        }

        this.carMarker.setLnglat(this.D3OverLayer.lineDatas[this.D3OverLayer.lineDatas.length - 1]);
        //车辆偏转角计算。
        if (this.options.Counter > 1) {
            var rotate = this.angle(
                this.D3OverLayer.lineDatas[this.D3OverLayer.lineDatas.length - 2],
                this.D3OverLayer.lineDatas[this.D3OverLayer.lineDatas.length - 1]);
            if(rotate!=0&&rotate!=360&&rotate!=-90)
                this.carMarker.setRotate(rotate)
        } else {
            this.carMarker.setRotate(0)
        }
        if (this.options.dynamicLine) this.d3redraw();

        /**回调函数，车辆每移动一次触发的函数
         *Lnglat：经过的坐标
         *index：节点序号。
         *length:总节点数量。
         ***/
        if (this.options.passOneNode) this.options.passOneNode(
            this.carMarker.getLnglat(),
            this.options.Counter,
            nodeslength
        )
        if (this.options.Counter >= nodeslength) {
            this.options.Counter = 0;
        }
    },


    /**
     * 计算轨迹的距离
     * @returns {number}
     */
    distance: function() {
        var d = 0;
        var datas = this.options.Datas;
        var l = datas.length;
        for (var i = 0; i < l - 1; i++) {
            var p1 = this.dataToLnglat(datas[i]);
            var p2 = this.dataToLnglat(datas[i + 1]);
            d = d + this.map.getDistance(p1, p2);
        }
        return d;
    },

    /**
     *在每个点的真实步骤中设置小车转动的角度
     */

    angle: function(curPos, targetPos) {
        var deg = 0;
        if (targetPos.lng != curPos.lng) {
            var tan = (targetPos.lat - curPos.lat) / (targetPos.lng - curPos.lng),
                atan = Math.atan(tan);
            deg = -atan * 360 / (2 * Math.PI);
            if (targetPos.lng < curPos.lng) {
                deg = -deg + 90 + 90;

            } else {
                deg = -deg;
            }
            return -deg;
        } else {
            var disy = targetPos.lat - curPos.lat;
            var bias = 0;
            if (disy > 0)
                bias = -1
            else
                bias = 1
            return (-bias * 90);
        }
        return;

    },

    /**
     *开始运动
     */
    start: function() {
        if (this.state == 4) return;
        this.state = 1;
        if (this.D3OverLayer && !this._timer) {
            this._timer = setInterval(this.bind(this.update, this),
                this.options.interval);
        }
    },

    /**
     * 停止运动
     */
    stop: function() {
        if (this.state == 4) return;
        this.state = 2;
        this._pause();
        this._Remove();
        this.init();

    },

    _pause: function() {
        if (this._timer) {
            clearTimeout(this._timer);
            delete this._timer;
            this._timer = null;
        }

        return this;
    },
    /**
     * 暂停运动
     */
    pause: function() {
        if (this.state == 4) return;
        this.state = 3;
        this._pause();
    },
    _deepCopy: function(source) {
        var result = {};
        for (var key in source) {
            result[key] = typeof source[key] === 'object' ? this._deepCopy(source[key]) : source[key];
        }
        return result;
    }
}