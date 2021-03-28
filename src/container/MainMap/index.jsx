import React, { useEffect, useState } from 'react'
import MapGL, { Source, Layer, Popup, NavigationControl, FlyToInterpolator } from 'react-map-gl'
import FlexBox from '../../styledComponent/FlexBox'
import FullPageSpin from '../../component/FullPageSpin'
import { getSecondItemFromArray, countby, getQuadrantByMean } from '../../utils'
import { g0vCityMapping } from '../../data/mapping'
import axios from 'axios'
import { meanBy, property } from 'lodash'
import logoPng from '../../logo.png'
import { connect } from 'react-redux'
import { setIsLoading } from '../../reducer/controller'
import { setStatistic, setCurrentCity } from '../../reducer/dashboard'

const stateMapping = {
  100: 'stage',
  1: 'on',
  98: 'fix',
  99: 'text',
}

const markLayerStyle = {
  'id': 'gostation_point',
  'source': 'point',
  'type': 'symbol',
  'layout': {
    'icon-image': 'go-station',
    'icon-allow-overlap': false
  }
}

const cityLayerStyle = {
  'id': 'city-layer',
  'type': 'fill',
  'source': 'states',
  'paint': {
    'fill-outline-color': {
      'property': 'quadrant',
      'stops': [
        [0, 'rgb(255,255,255)'],
        [1, 'rgb(13,157,3)'],
        [2, 'rgb(250,51,51)'],
        [3, 'rgb(255,172,68)'],
        [4, 'rgb(250,234,51)']
      ],
    },
    'fill-color': {
      'property': 'quadrant',
      'stops': [
        [0, 'rgba(255,255,255, 0.3)'],
        [1, 'rgba(13,157,3, 0.3)'],
        [2, 'rgba(250,51,51, 0.3)'],
        [3, 'rgba(255,172,68, 0.3)'],
        [4, 'rgba(250,234,51, 0.3)']
      ],
    },
    'fill-opacity': 0.5
  }
}

const TaiwanMap = (props) => {
  const geoJson = {
    type: 'FeatureCollection',
    features: []
  }
  const [viewport, setViewport] = useState({
    width: '100vw',
    height: '100vh',
    latitude: 23.6978,
    longitude: 120.9605,
    zoom: 8,
    minZoom: 8
  })
  const [stationGeoJson, setStationGeoJson] = useState(geoJson)
  const [cityGeoJson, setCityGeoJson] = useState(geoJson)
  const [isLoading, setIsLoading] = useState(true)
  const [popupInfo, setPopupInfo] = useState(null)
  const _mapRef = React.createRef()

  useEffect(() => {
    if (_mapRef.current === null) return
    const map = _mapRef.current.getMap()
    // let img = new Image(20,20)
    map.loadImage(logoPng, (err, image) => {
      if (err) {
        console.log(err)
        throw Error('map load error')
      }
      if (!map.hasImage('go-station')) {
        map.addImage('go-station', image, { alt: 'logo' }, false)
      }
    })
  }, [_mapRef])

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

  useEffect(() => {
    const { setIsLoading: _setIsLoading, setStatistic: _setStatistic } = props
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
          size_ratio: dt.station_ratio,
          quadrant,
        }
      })

      const featuresWithQuadrant = cityGeoLayer.features.map(dt => {
        let quadrant = 0
        const filterData = metricData.filter(o => o.name === dt.properties.name)
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

      setStationGeoJson(newGeo)
      setCityGeoJson(cityGeoLayer)
      setIsLoading(false)
      // reducer set
      _setIsLoading(false)
      _setStatistic(metricData)
    }
    fetchData()
  }, [])

  const onHover = (eve) => {
    const { features } = eve
    const hoveredFeature = features && features[0]
    setPopupInfo(null)
    if (!hoveredFeature) return
    const { properties } = hoveredFeature
    const hasInfo = properties && properties.type === 'feature_gostation'
    if (!hasInfo) return
    setPopupInfo(properties)
  }

  const onClick = (eve) => {
    const { features } = eve
    const hoveredFeature = features && features[0]
    if (!hoveredFeature) return
    const { properties, layer } = hoveredFeature
    if (!layer) return
    if (layer.id !== 'city-layer') return
    props.setCurrentCity({ value: properties.name, name: properties.COUNTYNAME })
    setViewport({
      longitude: eve.lngLat[0],
      latitude: eve.lngLat[1],
      zoom: 12,
      transitionInterpolator: new FlyToInterpolator({speed: 1.2}),
      transitionDuration: 'auto'
    })
  }

  return (
    <>
      {isLoading ? (<FullPageSpin />) :
        <MapGL
          ref={_mapRef}
          // controller={controller}
          {...viewport}
          // mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_ACCESS_TOKEN}
          mapStyle='mapbox://styles/yuningc0325/ckmnpe5yalnt817tfwbuf5yeu?optimize=true'
          onViewportChange={nextViewport => setViewport(nextViewport)}
          onHover={eve => onHover(eve)}
          onClick={onClick}
          interactiveLayerIds={['gostation_point', 'city-layer']}
        >
          {/* taiwan layer on city  */}
          <Source id='city_layer' type='geojson' data={cityGeoJson}>
            <Layer {...cityLayerStyle} />
          </Source>
          {/* {stationGeoJson.length > 0 ? <StaionMarker arr={stationGeoJson} /> : <></>} */}
          <Source id='station_mark' type='geojson' data={stationGeoJson}>
            <Layer {...markLayerStyle} />
          </Source>

          <NavigationControl />
          {popupInfo &&
            <Popup
              latitude={popupInfo.latitude}
              longitude={popupInfo.longitude}
              closeButton={false}
              closeOnClick={false}
              onClose={() => setPopupInfo(null)}
              anchor="bottom"
            >
              <FlexBox
                justifyContent='center'
                alignItems='flex-start'
                flexDirection='column'
                width='auto'
                height='100px' >
                <div><span style={{ fontWeight: 'bold' }}>站名:</span> {popupInfo.locName}</div>
                <div><span style={{ fontWeight: 'bold' }}>城市:</span> {popupInfo.city} | {popupInfo.district}</div>
                <div><span style={{ fontWeight: 'bold' }}>地址:</span> {popupInfo.address}</div>
              </FlexBox>
            </Popup>
          }
        </MapGL>
      }
    </>

    // <div>{stationGeoJson.map(o => (<div>{o.locName}</div>))}</div>
  )
}


export default connect(null, { setIsLoading, setStatistic, setCurrentCity })(TaiwanMap)
