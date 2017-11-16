/**
 * Created by yiding on 2017/1/12.
 */
import Vue from 'vue'

var pipeService = new Vue({
  data:{
    STATIONSREADY: 'station_ready',
    STATIONSELECTED: 'station_selected'
  },

  methods:{
    emitStationsReady: function(msg){
      this.$emit(this.STATIONSREADY, msg);
    },
    onStationsReady: function(callback){
      this.$on(this.STATIONSREADY,function(msg){
        callback(msg);
      })
    },
    emitStationSelected: function(msg){
      this.$emit(this.STATIONSELECTED, msg);
    },
    onStationSelected: function(callback){
      this.$on(this.STATIONSELECTED,function(msg){
        callback(msg);
      })
    },

  }
});

export default pipeService
