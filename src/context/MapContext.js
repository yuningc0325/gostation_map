import React, { createContext } from 'react'
import { countby, getQuadrantByMean, getSecondItemFromArray } from '../utils'
import { g0vCityMapping } from '../data/mapping'
import axios from 'axios'
import { meanBy } from 'lodash'

const geoJson = {
  type: 'FeatureCollection',
  features: []
}
const stateMapping = {
  100: 'stage',
  1: 'on',
  98: 'fix',
  99: 'text',
}
const initViewport = {
  width: '100vw',
  height: '100vh',
  latitude: 23.6978,
  longitude: 120.9605,
  zoom: 8,
  minZoom: 8
}

const parseStationData = (arr) => {
  return arr.map(dt => {
    const address = getSecondItemFromArray(JSON.parse(dt.Address)['List'])['Value']
    const city = getSecondItemFromArray(JSON.parse(dt.City)['List'])['Value']
    const district = getSecondItemFromArray(JSON.parse(dt.District)['List'])['Value']
    const locName = getSecondItemFromArray(JSON.parse(dt.LocName)['List'])['Value']
    return {
      id: dt.Id,
      latitude: dt.Latitude,
      longitude: dt.Longitude,
      zipCode: dt.ZipCode,
      address,
      city,
      city_en: JSON.parse(dt.City)['List'][0]['Value'],
      district,
      locName,
      stateCode: dt.State,
      state: stateMapping[dt.State],
      type: 'feature_gostation'
    }
  }).filter(dt => dt.state === 'on')
}

const MapContext = createContext({
  stationGeoJson: geoJson,
  cityGeoJson: geoJson,
  statistic: [],
  isLoading: true,
  popupInfo: null,
  test: 10,
  viewport: initViewport,
  setStationGeoJson: () => { },
  setCityGeoJson: () => { },
  setStatistic: () => { },
  setIsLoading: () => { },
  setPopupInfo: () => { },
  setViewport: () => {}
})

export class MapProvider extends React.Component {
  componentDidMount() {
    const fetchData = async () => {
      let result = []
      let aggrData = []
      let cityGeoLayer = {}
      try {
        const res = await axios.get('https://webapi.gogoro.com/api/vm/list')
        const twJson = await axios.get('taiwan_density.json')
        const cityJson = await axios.get('https://raw.githubusercontent.com/g0v/twgeojson/master/json/twCounty2010.geo.json')

        const { data: cityData } = twJson
        const { data: stationGeoJson } = res
        const { data: cityGeo } = cityJson
        cityGeo.features = cityGeo.features.map(dt => ({
          ...dt,
          properties: { ...dt.properties, name: g0vCityMapping[dt.properties.name] }
        }))
        cityGeoLayer = Object.assign({}, cityGeo)
        // log data
        result = parseStationData(stationGeoJson)
        // aggr data
        const resultInGroup = countby(result, 'city_en')
        aggrData = cityData.map(dt => {
          if (!resultInGroup[dt.city]) return {}
          const {
            count: station_count,
            ratio: station_ratio
          } = resultInGroup[dt.city][0]
          return {
            ...dt,
            station_density: station_count ? (station_count / dt.area) : 0,
            station_count,
            station_ratio,
          }
        }).filter(dt => Object.values(dt).length > 0)

      } catch (err) {
        console.log(err)
        alert('Something Went Wrong')
      }
      const newGeo = {
        type: 'FeatureCollection',
        features: result.map(dt =>
        ({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [dt.longitude, dt.latitude] },
          properties: { ...dt }
        })
        )
      }

      // use for feed to d3
      const xMean = meanBy(aggrData, o => o.station_density)
      const yMean = meanBy(aggrData, o => o.population_density)
      const metricData = aggrData.map(dt => {
        const quadrant = getQuadrantByMean(dt.station_density, dt.population_density, xMean, yMean)
        return {
          name: dt.city,
          size: dt.station_count,
          x: dt.station_density,
          y: dt.population_density,
          quadrant
        }
      })

      const featuresWithQuadrant = cityGeoLayer.features.map(dt => {
        let quadrant = 0
        const filterData = metricData.filter(o => o.name == dt.properties.name)
        if (filterData.length !== 0) quadrant = filterData[0]['quadrant']
        return ({
          ...dt,
          properties: {
            ...dt.properties,
            quadrant
          }
        })
      })
      cityGeoLayer.features = featuresWithQuadrant

      this.setStationGeoJson(newGeo)
      this.setCityGeoJson(cityGeoLayer)
      this.setStatistic(metricData)
      this.setIsLoading(false)
    }
    fetchData()
  }

  setStationGeoJson = (value) => {
    this.setState({ stationGeoJson: value })
  }

  setCityGeoJson = (value) => {
    this.setState({ cityGeoJson: value })
  }

  setStatistic = (value) => {
    this.setState({ statistic: value })
  }

  setIsLoading = (value) => {
    this.setState({ isLoading: value })
  }

  setPopupInfo = (value) => {
    this.setState({ popupInfo: value })
  }

  setViewport = (value) => {
    this.setState({ viewport: value })
  }

  state = {
    stationGeoJson: geoJson,
    cityGeoJson: geoJson,
    statistic: [],
    isLoading: true,
    popupInfo: null,
    viewport: initViewport,
    setStationGeoJson: this.setStationGeoJson,
    setCityGeoJson: this.setCityGeoJson,
    setStatistic: this.setStatistic,
    setIsLoading: this.setIsLoading,
    setPopupInfo: this.setPopupInfo,
    setViewport: this.setViewport
  }

  render() {
    return (
      <MapContext.Provider value={this.state}>
        {this.props.children}
      </MapContext.Provider>
    )
  }
}

export const MapConsumer = MapContext.Consumer
