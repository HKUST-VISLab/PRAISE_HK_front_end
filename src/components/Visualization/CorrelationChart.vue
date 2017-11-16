<template>
  <el-row :gutter="2" >
    <el-col :span="16" class="vis"></el-col>
    <el-col :span="8" class="ctrl">
      <el-row  class="rowclass">
        <el-radio-group size = "small" v-model="aqi">
          <el-radio-button  style="float: left;margin-top: 2px;" v-for="m in aqis" v-bind:label="m" :key="m" @click="aqi = m"></el-radio-button>
        </el-radio-group>
      </el-row>
      <el-row class="rowclass">
        <el-radio-group size = "small"  v-model="metric">
          <el-radio-button style="float: left" v-for="m in metrics" v-bind:label="m" :key="m" @click="metric = m"></el-radio-button>
        </el-radio-group>
      </el-row>
      <el-row class="rowclass">
        <el-radio-group size = "small"  v-model="hourRange">
          <el-radio-button style="float: left" v-for="m in hourRanges" v-bind:label="m" :key="m" @click="metric = m"></el-radio-button>
        </el-radio-group>
      </el-row>

      <el-row class="rowclass">
        <el-button size="small" v-on:click="confirm">Confirm</el-button>
      </el-row>
    </el-col>
  </el-row>
</template>
<!--primary,success,warning,danger,info,text-->
<script>
  import CorrelationChart from '../../lib/CorrelationChart.js'
  import pipeService from '../../service/pipeService'
  import dataService from '../../service/dataService'
  import * as Config from '../../Config.js'

  import * as d3 from "d3"
  export default {
    name: 'correlation',
    props:['selectedStation'],
    data () {
      return {
        title: 'correlation',
        corrData: null,

        metric: null,
        metrics: Config.metrics,

        aqis: Config.aqis,
        aqi: "PM2_5",

        hourRange: '6hour',
        hourRanges: Config.hourRange
      }
    },
    mounted(){
      let vicEle = d3.select(this.$el).select(".vis").node();
      this.correlationChart = new CorrelationChart(vicEle);
      let stationId = this.selectedStation['id'];
      let attr = "PM2_5";
      this.metric = this.metrics[1];
    },

    beforeDestroy(){
    },
    computed:{
    },
    methods:{
      confirm(){
        let stationId = this.selectedStation['id'];
        let hourRange = parseInt(this.hourRange.substring(0, this.hourRange.length - 4));
        let AQI = this.aqi;
        let metric = this.metric;
        console.log('metric', metric);
        dataService.getCorrRecordsOfStation(stationId, AQI, hourRange, metric,  null, null, (data)=>{
          this.corrData = data;
        });
      }
    },
    watch:{
      corrData(newData, oldData){
        if(newData){
          this.correlationChart.setData(newData);
        }
      },
      metric(newData, oldData){
        console.log('enwData', newData);
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .vis{
    height: 100%
  }
  .ctrl{
    height: 100%;
    background-color: aquamarine;
  }
  .rowclass{
    clear: left;
    float: left;
    margin-top: 20px;
    margin-left: 10px;
  }

</style>
