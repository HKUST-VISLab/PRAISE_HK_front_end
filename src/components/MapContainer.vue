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
<style scoped>

</style>
