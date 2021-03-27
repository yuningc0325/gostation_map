import React, { useEffect, useState } from 'react'
import MapGL, { Source, Layer, Popup, NavigationControl } from 'react-map-gl'
import { Card, Skeleton, Typography } from 'antd'
import FlexBox from '../../styledComponent/FlexBox'
import FullPageSpin from '../../component/FullPageSpin'
import { getSecondItemFromArray, countby } from '../../utils'
import axios from 'axios'
// import logoSVG from '../../logo.svg'
import logoPng from '../../logo.png'
import { CardStyle } from './style'

// 打點
// https://docs.mapbox.com/mapbox-gl-js/example/filter-features-within-map-view/
// https://docs.mapbox.com/mapbox-gl-js/example/data-driven-circle-colors/
// 標區
// https://docs.mapbox.com/mapbox-gl-js/example/data-join/
// 標區＋legend
// https://docs.mapbox.com/mapbox-gl-js/example/updating-choropleth/
const stateMapping = {
  100: '準備啟用中',
  1: '啟用中',
  98: '維修中',
  99: '測試中',
}

const layerStyle = {
  'id': 'gostation_point',
  'source': 'point',
  'type': 'symbol',
  'layout': {
    'icon-image': 'go-station',
    'icon-allow-overlap': false
  }
}

// const StaionMarker = React.memo(({ arr }) => {
//   return arr.map(station => (
//     <Marker
//       key={station.rid}
//       latitude={station.latitude}
//       longitude={station.longitude}
//     >
//       <img style={{ zIndex: 999, width: 30, height: 30 }} src={logoSVG} />
//     </Marker>
//   ))
// })

const TaiwanMap = () => {
  const geoJson = {
    type: 'FeatureCollection',
    features: []
  }
  const [viewport, setViewport] = useState({
    width: '100vw',
    height: '100vh',
    latitude: 23.6978,
    longitude: 120.9605,
    zoom: 8
  })
  const [stationGeoJson, setStationGeoJson] = useState(geoJson)
  const [statistic, setStatistic] = useState([])
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
        map.addImage('go-station', image, {alt:'logo'}, false)
      }
      // img.src = logoSVG
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
    }).filter(dt => dt.state === '啟用中')
  }

  useEffect(() => {
    const fetchData = async () => {
      let result = []
      let aggrData = []
      try {
        const res = await axios.get('https://webapi.gogoro.com/api/vm/list')
        const twJson = await axios.get('taiwan_density.json')
        const { data: cityData } = twJson
        const { data: stationGeoJson } = res
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
            station_ratio
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
      setStationGeoJson(newGeo)
      console.log(aggrData)
      setStatistic(aggrData)
      setIsLoading(false)
    }
    fetchData()
  }, [])

  const onHover = (eve) => {
    const { features } = eve
    const hoveredFeature = features && features[0]
    setPopupInfo(null)
    if(!hoveredFeature) return
    const { properties } = hoveredFeature
    const hasInfo = properties && properties.type === 'feature_gostation'
    if(!hasInfo) return 
    setPopupInfo(properties)
    // const currentFeature =   hoveredFeature
    // ? {
    //     feature: hoveredFeature,
    //     x: offsetX,
    //     y: offsetY
    //   }
    // : null
    // console.log(currentFeature)
  }

  return (
    <>
      <Card style={CardStyle}>
        <Skeleton loading={isLoading} paragraph={{ rows: 1 }}>
          <Typography>總站數:
              <span>{statistic.reduce((pre, cur) => pre + cur.station_count, 0)}</span>
          </Typography>
        </Skeleton>
      </Card>
      {isLoading ? (<FullPageSpin />) :
        <MapGL
          ref={_mapRef}
          // controller={controller}
          {...viewport}
          // mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_ACCESS_TOKEN}
          mapStyle='mapbox://styles/yuningc0325/ckmnpe5yalnt817tfwbuf5yeu?optimize=true'
          onViewportChange={nextViewport => setViewport(nextViewport)}
          onHover={eve => onHover(eve)}
        >
          {/* {stationGeoJson.length > 0 ? <StaionMarker arr={stationGeoJson} /> : <></>} */}
          <Source id='station_mark' type='geojson' data={stationGeoJson}>
            <Layer {...layerStyle} />
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
                <div><span style={{fontWeight:'bold'}}>站名:</span> {popupInfo.locName}</div>
                <div><span style={{fontWeight:'bold'}}>城市:</span> {popupInfo.city} | {popupInfo.district}</div>
                <div><span style={{fontWeight:'bold'}}>地址:</span> {popupInfo.address}</div>
              </FlexBox>
            </Popup>
          }
        </MapGL>
      }
    </>

    // <div>{stationGeoJson.map(o => (<div>{o.locName}</div>))}</div>
  )
}


export default TaiwanMap
