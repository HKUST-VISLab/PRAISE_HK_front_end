/**
 * Created by qshen on 4/7/2017.
 */
import L from "leafLet";
import 'leaflet/dist/leaflet.css'
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
    layers: [this.streets, this.cities],
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
      let _color = iconType == 'aqi'?'red':'blue';
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
export default DetailMap
