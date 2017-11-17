/**
 * Created by qshen on 4/7/2017.
 */
import L from "leafLet";
import 'leaflet/dist/leaflet.css'

export const serverLink = 'http://127.0.0.1:9930/';

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
        'id': stations[i].station_code
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
        .bindPopup(generatePopUpDiv(station_code, 5, '2017-06-31 14:32'));
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
function generatePopUpDiv(label, level, time){
  return  '<div style="width: 150px; height: 350px; ";>' +
    '<p class = "LabelDescription" style="font-size: 20px;color:'+ AQHILevel2Color(level)+'">'+ label + '</p>' +

    '<div>' +
        generateSubPopUpDiv('PM2.5', 'green', 43)
      +
        generateSubPopUpDiv('PM10', 'rgb(37, 232, 44)', 5)
      +
        generateSubPopUpDiv('NO2', 'rgb(37, 232, 44)', 25)
      +
        generateSubPopUpDiv('CO', 'rgb(37, 232, 44)', 7)
      +
        generateSubPopUpDiv('O3', 'rgb(37, 232, 44)', 25)
      +
        generateSubPopUpDiv('SO2', 'rgb(37, 232, 44)', 2)
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



export default DetailMap
