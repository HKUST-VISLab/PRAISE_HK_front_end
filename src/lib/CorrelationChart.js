import * as d3 from "d3"
let models = ["CAMx", "CMAQ", "NAQPMS"];
let colors = ['rgb(231, 186, 82)', 'rgb(214, 97, 107)', 'rgb(181, 207, 107)', 'blue']
let CorrelationChart = function(el){
  this.el = el;
  this.width = el.clientWidth;
  this.height = el.clientHeight;
  this.svg = d3.select(this.el).append('svg')
    .attr('width', this.width)
    .attr('height', this.height);

  this.containerMarginTopAndBottom = 20;
  this.containerMarginLeftAndRight = 30;

};

CorrelationChart.prototype.setData = function(dataList){
  console.log('dataList', dataList[0])
  this.svg.selectAll('.chartContainer').remove();
  this.container = this.svg.append('g').attr('class', 'chartContainer');
  this.dataList = dataList;
  this.draw(dataList);
  this.drawBrushArea();
};

CorrelationChart.prototype.draw = function(dataList, index){
  let _this = this;
  index = index == undefined ? 0: 1;
  let numberOfContainers = models.length + 2;
  let unitHeight = this.height / numberOfContainers;
  let corrContainerWidth = this.width ;
  let startTime = new Date(dataList[0].time * 1000);
  let endTime = new Date(dataList[dataList.length - 1].time * 1000);
  let attrs = models.concat(['obs']);

  let maxDiff = d3.max(dataList, (dataObj,i)=>{
    let arr = [];
    attrs.forEach((attr)=>{
      arr.push(dataObj.diff[attr])
    });
    return d3.max(arr,value=>{
      return parseFloat(value);
    });
  });
  let minDiff = d3.min(dataList, (dataObj,i)=>{
    let arr = [];
    attrs.forEach((attr)=>{
      arr.push(dataObj.diff[attr])
    });
    return d3.min(arr,value=>{
      return parseFloat(value);
    });
  });

  let xCorrScale = d3.scaleTime()
    .range([this.containerMarginLeftAndRight, corrContainerWidth - this.containerMarginLeftAndRight])
    .domain([startTime, endTime]);

  let yCorrScale = d3.scaleLinear()
    .range([unitHeight - this.containerMarginTopAndBottom, this.containerMarginTopAndBottom])
    .domain([minDiff, maxDiff]);


  let maxValue = d3.max(dataList, (dataObj,i)=>{
    return d3.max(dataObj.data, (d,i)=>{
      let arr = [];
      attrs.forEach((attr)=>{
        arr.push(d[attr])
      });
      return d3.max(arr,value=>{
        return parseFloat(value);
      });
    })
  });
  let minValue = d3.min(dataList, (dataObj,i)=>{
    return d3.min(dataObj.data, (d,i)=>{
      let arr = [];
      attrs.forEach((attr)=>{
        arr.push(d[attr])
      });
      return d3.min(arr,value=>{
        return parseFloat(value);
      });
    })
  });

  let yValueScale = d3.scaleLinear()
    .range([unitHeight - this.containerMarginTopAndBottom, this.containerMarginTopAndBottom])
    .domain([minValue, maxValue]);

  this.container.selectAll('.valueChart').remove();
  this.container.selectAll('.corrChart').remove();
  let valueChartContainer = this.container.append('g').attr('class', 'valueChart')
  let valueContainers = valueChartContainer
    .selectAll('.valueLine')
    .data(attrs).enter()
    .append('g').attr('class', 'valueLine');
  let xAxis = d3.axisBottom(xCorrScale);
  let yAxis = d3.axisLeft(yValueScale);
  valueChartContainer.append('g').attr('class', 'x-axis')
    .attr('transform', 'translate(0, ' + (unitHeight - _this.containerMarginTopAndBottom )   + ')')
    .call(xAxis);

  valueChartContainer.append('g').attr('class', 'y-axis')
    .attr('transform', 'translate(' + (_this.containerMarginLeftAndRight) + ',0)')
    .call(yAxis);

  valueContainers.each(function(attr, i){
    let line = d3.line()
      .x(function(d) { return xCorrScale(new Date(d.time * 1000)); })
      .y(function(d) { return yValueScale(d.data[0][attr]); });

    let valueContainer = d3.select(this);
    valueContainer.append('path')
      .datum(dataList)
      .attr('d', line)
      .attr('fill', 'none')
      .attr('stroke', colors[i])
      .attr('opacity', 0.5);

  });

  let corrChartContainer = this.container.append('g').attr('class', 'corrChart');
  let corrContainers = corrChartContainer.selectAll('.corrContainer')
    .data(models)
    .enter()
    .append('g').attr('class', 'corrContainer')
    .attr('transform', (d, i)=>{
      return 'translate(0, ' + (i+1) * unitHeight + ')';
    });

  corrContainers.append('rect').attr('width', corrContainerWidth)
    .attr("height", unitHeight)
    .attr('stroke', '#999').attr('fill', 'none');

  corrContainers.each(function(model, i){
    let corrContainer = d3.select(this);
    corrContainer.append('text').text(model)
      .attr('x', _this.containerMarginLeftAndRight + 5)
      .attr('y', _this.containerMarginTopAndBottom + 20)
    let xAxis = d3.axisBottom(xCorrScale);
    let yAxis = d3.axisLeft(yCorrScale);
    corrContainer.append('g').attr('class', 'x-axis')
      .attr('transform', 'translate(0, ' + (yCorrScale(0))  + ')')
      .call(xAxis);
    corrContainer.append('g').attr('class', 'y-axis')
      .attr('transform', 'translate(' + (_this.containerMarginLeftAndRight) + ',0)')
      .call(yAxis);
    let _w = (corrContainerWidth - _this.containerMarginLeftAndRight * 2) /dataList.length;
    corrContainer.selectAll('.bar')
      .data(dataList).enter().append('rect').attr('class', 'bar')
      .attr('x', (d)=>{
        let _x = xCorrScale(new Date(d.time * 1000));
        return _x;
      })
      .attr('width', _w)
      .attr('y', (d)=>{
        let value = d.diff[model][0];
        if(value < 0){
          return yCorrScale(0);
        }else{
          return yCorrScale(value);
        }
      })
      .attr('height', (d)=>{
        let value = d.diff[model][0];
        let h = Math.abs(yCorrScale(0) - yCorrScale(value));
        return h;
      })
      .attr('fill', colors[i])
      .attr('opacity', 0.5);
  });
};


CorrelationChart.prototype.drawBrushArea = function(){
  let _this = this;
  let numberOfContainers = models.length + 2;
  let unitHeight = this.height / numberOfContainers;
  let corrContainerWidth = this.width;
  let dataList = this.dataList;
  let startTime = new Date(dataList[0].time * 1000);
  let endTime = new Date(dataList[dataList.length - 1].time * 1000);

  let xCorrScale = d3.scaleTime()
    .range([this.containerMarginLeftAndRight, corrContainerWidth - this.containerMarginLeftAndRight])
    .domain([startTime, endTime]);

  let attrs = models.concat(['obs']);

  let maxValue = d3.max(dataList, (dataObj,i)=>{
    return d3.max(dataObj.data, (d,i)=>{
      let arr = [];
      attrs.forEach((attr)=>{
        arr.push(d[attr])
      });
      return d3.max(arr,value=>{
        return parseFloat(value);
      });

    })
  });
  let minValue = d3.min(dataList, (dataObj,i)=>{
    return d3.min(dataObj.data, (d,i)=>{
      let arr = [];
      attrs.forEach((attr)=>{
        arr.push(d[attr])
      });
      return d3.min(arr,value=>{
        return parseFloat(value);
      });
    })
  });

  let yValueScale = d3.scaleLinear()
    .range([unitHeight - this.containerMarginTopAndBottom, this.containerMarginTopAndBottom])
    .domain([minValue, maxValue]);

  this.container.selectAll('.context').remove();

  let contextChartContainer = this.container.append('g').attr('class', 'context')
    .attr('transform', 'translate(0, ' + (4) * unitHeight + ')');
  let valueContainers = contextChartContainer
    .selectAll('.valueLine')
    .data(attrs).enter()
    .append('g').attr('class', 'valueLine');
  let xAxis = d3.axisBottom(xCorrScale);
  let yAxis = d3.axisLeft(yValueScale);
  contextChartContainer.append('g').attr('class', 'x-axis')
    .attr('transform', 'translate(0, ' + (unitHeight - _this.containerMarginTopAndBottom )   + ')')
    .call(xAxis);

  contextChartContainer.append('g').attr('class', 'y-axis')
    .attr('transform', 'translate(' + (_this.containerMarginLeftAndRight) + ',0)')
    .call(yAxis);

  valueContainers.each(function(attr, i){
    let line = d3.line()
      .x(function(d) { return xCorrScale(new Date(d.time * 1000)); })
      .y(function(d) { return yValueScale(d.data[0][attr]); });

    let valueContainer = d3.select(this);
    valueContainer.append('path')
      .datum(dataList)
      .attr('d', line)
      .attr('fill', 'none')
      .attr('stroke', colors[i])
      .attr('opacity', 0.5)
  });
  let timeMarker = null;
  function brushed() {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
    var s = d3.event.selection || xCorrScale.range();
    let domain = s.map(xCorrScale.invert, xCorrScale);


    if (timeMarker) clearTimeout(timeMarker);
    timeMarker = setTimeout(d=>{
      let startTime = domain[0].getTime();
      let endTime = domain[1].getTime();

      let dataList = _this.getData(startTime, endTime);
      _this.draw(dataList);
    }, 200);
  }
  var brush = d3.brushX()
    .extent([[this.containerMarginLeftAndRight, this.containerMarginTopAndBottom],
      [this.width - this.containerMarginLeftAndRight, unitHeight - this.containerMarginTopAndBottom]])
    .on("brush end", brushed);

  contextChartContainer.append("g")
    .attr("class", "brush")
    .call(brush)
    .call(brush.move, xCorrScale.range());
};
CorrelationChart.prototype.getData = function(startTime, endTime){
  let dataList = [];
  this.dataList.forEach((d, i)=>{
    if(d.time * 1000>= startTime && d.time * 1000<= endTime)
      dataList.push(d)
  })
  return dataList;
};

export default CorrelationChart;
