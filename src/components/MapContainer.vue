<template>
  <div class="mapview">
  </div>
</template>

<script>

  //  import dataService from '../../service/dataService'
  import pipeService from '../service/pipeService'
  import DetailMap from '../lib/DetailMap'
  export default {
    name: 'mapview',
    data () {
      return {
        title: 'mapview',
      }
    },
    mounted(){
      this.map = new DetailMap(this.$el, {
        center: [22.365354, 114.105228],
        bound: null
      });
      this.map.on('clickOnIcon' , function(stationFeature){
        console.log('station feature', stationFeature);
        pipeService.emitStationSelected(stationFeature)
      });

      pipeService.onStationsReady((stations)=>{
        this.map.setMarks(stations, function(d){
          return d.loc;
        })
      })
    },
    computed:{
    },
    methods:{

    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>

  /*modify leaflet*/
  .leaflet-div-icon {
    border: 0.5px solid #f0f0f0;
  }
  .leaflet-popup-content-wrapper{
    border-radius: 2px;
  }
  .leaflet-popup-content{
    margin: 5px 20px;
    line-height: 1.4;
  }

  .Description {
    margin-left: 5px;
    font-size: 14px;

    float: left;
    padding-top: 3px;
  }
  .LabelDescription{
    border-bottom: 1px solid #f2f2f2;
  }
  .DetailMapDescription {

    float: left;
    width: 170px;

  }
  .FeatureDescription{

    float: left;
    padding-top: 3px;
  }
  .ItemDescription {

    float: left;
    width: 60px;
    display: inline;
  }
  .IconDescription {
    float: left;
    margin-left: 10px;
    margin-top: 3px;
    height: 12px;
    width: 12px;
    display: inline;
  }
  .ValueDescription {
    float: left;
    padding-left: 5px;
  }
  .StationDescription {
    margin-top: 10px;
    border-top: 1px solid #f2f2f2;
    width: 100%;
    float: left;
  }
</style>
