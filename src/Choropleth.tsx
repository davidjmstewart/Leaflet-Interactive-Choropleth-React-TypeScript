import React, { createRef, Component } from 'react'
import { Map, TileLayer, GeoJSON } from 'react-leaflet'
import { LatLngTuple, PathOptions, Layer, LeafletEvent } from 'leaflet'
import Control from 'react-leaflet-control';
import * as states from './states';

type State = {
  lat: number,
  lng: number,
  zoom: number,
  popDensity: number,
  stateName: string
}

const grades: Array<number> = [0, 10, 20, 50, 100, 200, 500, 1000];

export default class Choropleth extends Component<{}, State> {
  state = {
    lat: 41.881832,
    lng: -87,
    zoom: 5,
    popDensity: 0,
    stateName: ""
  }

  mapRef: any = {};

  constructor(props: any) {
    super(props);
    this.mapRef = createRef();
  }

  getColor(d: number) {
    return d > 1000 ? '#800026' :
      d > 500 ? '#BD0026' :
      d > 200 ? '#E31A1C' :
      d > 100 ? '#FC4E2A' :
      d > 50 ? '#FD8D3C' :
      d > 20 ? '#FEB24C' :
      d > 10 ? '#FED976' :
      '#FFEDA0';
  }

  style (feature: GeoJSON.Feature): PathOptions {
    if (feature && feature.properties) {
      return {
        fillColor: this.getColor(feature.properties.density),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
      };
    }
    return {}
  }

  highlightFeature(e: LeafletEvent) {
    if (e.target) {
      var layer = e.target;
      layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
      });
    }
  }

  onEachFeature(feature: GeoJSON.Feature, layer: Layer) { 
    layer.on({
      mouseover: (e: LeafletEvent) => {
        if (e.target) {
          if (feature && feature.properties) {
            this.setState({ popDensity: feature.properties.density, stateName: feature.properties.name })
          }
          var layer = e.target;
          layer.setStyle({
            weight: 5,
            color: '#666',
            dashArray: '',
            fillOpacity: 0.7
          });
        }
      },
      mouseout: () => { 
        let l: any = layer;
        if (feature && feature.properties) {
          l.setStyle({
            fillColor: this.getColor(feature.properties.density),
            weight: 2,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: 0.7
          });
          this.setState({ popDensity: 0, stateName: "" })
        }
      },
      click: (e: LeafletEvent) => {
        const map = this.mapRef.current.leafletElement;
        map.fitBounds(e.target.getBounds());
      }
    });
  }

  render() {
    const position: LatLngTuple = [this.state.lat, this.state.lng]
    return (
      <Map ref={this.mapRef} center={position} zoom={this.state.zoom} style={{ width: '100%', height: '100vh' }} >
        <TileLayer
          attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
          url='https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png'
        />
        <GeoJSON key='my-geojson' data={states.statesData} style={(poly: any) => { return this.style(poly) }} onEachFeature={(feature: GeoJSON.Feature, layer: Layer) => this.onEachFeature(feature, layer)} />
        <Control position="topright" >
          <div className="info">
            <h4>US Population Density</h4>
            {this.state.popDensity > 0 ? <><b>{this.state.stateName} </b> <br /><b>{this.state.popDensity} </b> <br /></> : "Hover over a state"}
          </div>
        </Control>
        <Control position="bottomright" >
          <div className="info legend">
            {
              grades.map((grade: number, index: number) => {
                return (
                  <div key={index}>
                    <i key={index} style={{ 'backgroundColor': this.getColor(grade + 1) }}/>
                    {grade}{index === grades.length - 1 ? "+" : <>&ndash;{grades[index + 1]}<br /></>}                  
                  </div>
                )
              })
            }
          </div>
        </Control>
      </Map>
    )
  }
}
