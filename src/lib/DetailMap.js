/**
 * Created by qshen on 4/7/2017.
 */
import L from "leafLet";
import 'leaflet/dist/leaflet.css'

export const serverLink = 'http://127.0.0.1:9930/';

let AQMap = {
  'AQHI':'AQHI',
  'AQI':'AQI',
  'CO':'CO',
  'NO2':'NO2',
  'NOX':'NOX',
  'O3':'O3',
  'PM2.5':'PM2_5',
  'PM10':'PM10',
  'SO2':'SO2'

}
let DetailMap = function(el, config){
  this.$el = el;
  this.bound = config.bound;
  this.center = config.center;
  this.init();
};

DetailMap.prototype.init = function(){
  this.cities = new L.LayerGroup();
  var mbAttr = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
      '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
      'Imagery © <a href="http://mapbox.com">Mapbox</a>',
    mbUrl = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoieWlkaW5neWlkaW4iLCJhIjoiY2lnajcwMjIxMDAyM3R0bHVsamh5M3B2diJ9.-ZvX8uRwCv4IdYSvzi7HPg';

  this.grayscaleDark   = L.tileLayer(mbUrl, {id: 'mapbox.dark', attribution: null});
  this.grayscaleLight   = L.tileLayer(mbUrl, {id: 'mapbox.light', attribution: null});
  this.streets  = L.tileLayer(mbUrl, {id: 'mapbox.streets',   attribution: null});
  this.outdoor  = L.tileLayer(mbUrl, {id: 'mapbox.outdoors',   attribution: null});
  this.satellite = L.tileLayer(mbUrl, {id: 'mapbox.satellite',   attribution: null});
  this.map = L.map(this.$el, {
    center: this.center,
    zoom: 11,
    layers: [this.outdoor, this.cities],
    zoomControl: false,
    maxZoom: 18,
    rotate: true,
    touchRotate: true
  });
  this.baseLayers = {
    "GrayScaleLight": this.grayscaleLight,
    "GrayScaleDark": this.grayscaleDark,
    "Streets": this.streets,
    "Outdoor": this.outdoor,
    "satellite": this.satellite
  };
  L.control.layers(this.baseLayers).addTo(this.map);


};


DetailMap.prototype.setMarks = function(stations, getLoc){
  console.log('stations', stations);
  stations.forEach((station, i) =>{
    station.loc = station.type == 'aqi'? station.loc.reverse(): station.loc;
  });
  let iconList = [];
  for(var i = 0, ilen = stations.length; i < ilen; i++){
    iconList.push({
      "type": "Feature",
      "properties": {
        'iconType': stations[i].type,
        'id': stations[i]['station_code'],
        'station_record': stations[i]
      },
      "geometry": {
        "type": "Point",
        "coordinates": stations[i].loc
      },
    })
  }

  let pointsLayer = L.geoJSON(iconList, {
    pointToLayer:  (feature, latlng)=>{
      let iconType = feature.properties.iconType;
      let station_code = feature.properties.id;
      let _color = iconType == 'aqi'?'red':'blue';
      if(iconType != 'aqi'){
        return null
      }


      var myIcon = L.divIcon({
        iconSize: new L.Point(latlng[0], latlng[1]),
        html: generateDiv(station_code, 5)
      });
      L.marker(latlng, {icon: myIcon}).addTo(this.map)
        .bindPopup(generatePopUpDiv(station_code, feature.properties.station_record, '2017-06-31 14:32'));
      let circleMarker = L.circleMarker(latlng, {
        radius: 3,
        fillColor: _color,
        color: _color,
        opacity: 0.5,
        fillOpacity: 1
      });

      return circleMarker;
    }
  });
  pointsLayer.on('click', (d, i)=>{
    let stationConfig = {
      'loc': d.layer.feature.geometry.coordinates,
      'iconType': d.layer.feature.properties.iconType,
      'id': d.layer.feature.properties.id
    };
    this.clickOnIcon(stationConfig);
  });
  pointsLayer.addTo(this.map);
};

DetailMap.prototype.on = function(event, func){
  if(event == 'clickOnIcon'){
    this.clickOnIcon = func;
  }
};
function AQHILevel2Color(level){
  if(level < 1){
    return 'grey'
  }else if(level > 10){
    level = 11
  }

  let colors = ['#4DB748','#4DB748','#4DB748', '#FBA417', '#FBA417', '#FBA417','#ED1B24','#99380E','#99380E','#99380E','#000000'];
  return colors[level - 1]
}
function generateDiv(label, level){
  return  '<div style="width: 100px; height: 20px; ";>' +
    '<div style="width:25%; background-color:'+ AQHILevel2Color(level) +'; height: 18px;float: left">' + level + '</div>' +
    '<div style="float: left; width: 75%">' + label + '</div>' +
    '</div>';
};

function generateSubPopUpDiv(feature, color, value){

  return  '<div class="Description">' +
        '<div class="ItemDescription">'+ feature +'</div>' +
        '<div class="IconDescription" style="background-color: '+ color +';"></div>' +
        '<div class="ValueDescription">'+value+'</div>' +
      '</div>'
}
function generateStaionPopUp(station_code){
  let post_url = 'get_aq_station_img?station_code=' + station_code;

  return '<div class="StationDescription"> ' +
      '<div style="margin-top: 15px;text-align: center">' +
        '<img src="http://127.0.0.1:9000/'+ post_url +'" width="95%"> ' +
      '</div>'+
    '</div>'
}
function generatePopUpDiv(label, AQAggregation, time){
  let str = ''
  for(let aq in AQMap){
    if(AQAggregation['recent'] == null){
      continue
    }
    str += generateSubPopUpDiv(aq, Feature2Color(AQAggregation['recent'][AQMap[aq]]['obs'], aq), AQAggregation['recent'][AQMap[aq]]['obs'])
  }
  return  '<div style="width: 150px; height: 420px; ";>' +
    '<p class = "LabelDescription" style="font-size: 20px;color:'+ AQHILevel2Color(1)+'">'+ AQAggregation['station_code'] + '</p>' +

    '<div>' +
      str
      +
    '</div>'
      +
        generateStaionPopUp(label)
      +
    '<div class="StationDescription">' +
        '<div style="margin-top: 10px; margin-left: 5px; font-size: 10px">' +
          'Update: ' + time +
        '</div>'+
    '</div>' +
  '</div>';
};

// function Feature2Color(level, AQ){
//   console.log('level', level, AQ);
//   if(level == null){
//     return 'grey'
//   }
//   if(level < 0){
//     return 'grey'
//   }else if(level > 10){
//     level = 11
//   }
//   let v = Math.floor(level) < 1 ? 1 : Math.floor(level)
//   v-= 1
//   let colors = ['#4DB748','#4DB748','#4DB748', '#FBA417', '#FBA417', '#FBA417','#ED1B24','#99380E','#99380E','#99380E','#000000'];
//   return colors[v]
// }


function Feature2Color(level, AQ){

  if(level == null){
    return 'grey'
  }
  let index = null;
  let segArr = null;
  if(AQ == 'AQI'){
    segArr = [50, 100, 150, 200, 300, 500];
  }else if(AQ == 'AQHI'){
    segArr = [3, 6, 7, 10]
  }else if(AQ == 'O3'){
    segArr = [54, 70, 85, 105, 200,404, 504, 604]
  }else if(AQ == 'PM2.5'){
    segArr = [12, 35.4, 55.4, 150.4, 250.4,350.4, 500.4]
  }else if(AQ == 'PM10'){
    segArr = [54, 154, 254, 354, 424, 504, 604]
  }else if(AQ == 'CO'){
    segArr = [4.4, 9.4, 12.4, 15.4, 30.4, 40.4, 50.4]
  }else if(AQ == 'SO2'){
    segArr = [35, 75, 185, 304, 604, 804, 1004]
  }else if(AQ == 'NO2'){
    segArr = [53,100, 360, 649, 1249, 1649, 2049]
  }else if(AQ == 'NOX'){
    segArr = [53,100, 360, 649, 1249, 1649, 2049]
  }else{
    return 'blue'
  }

  for(let i = 0, ilen = segArr.length; i < ilen; i++){
    if(level <= segArr[i]){
      index = i;
      break;
    }
  }
  if(index == null){
    index = segArr.length;
  }
  console.log(AQ, level, segArr, index)
  let colors = ['#00FF0C', '#4DB748', '#FBA417', '#ED1B24','#ED1B24','#ED1B24','#99380E','#99380E','#000000'];
  return colors[index]
}

export default DetailMap
