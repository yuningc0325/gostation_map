import React, { useEffect, useState } from 'react'
import ReactMapGL, { Marker } from 'react-map-gl'
import { Card, Skeleton, Typography, Spin } from 'antd'
import FullPageSpin from '../component/FullPageSpin'
import { groupBy } from 'lodash'
import { getSecondItemFromArray, countby } from '../utils'
import axios from 'axios'
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

const StaionMarker = React.memo(({ arr }) => {
  return arr.map(station => (
    <Marker
      key={station.rid}
      latitude={station.latitude}
      longitude={station.longitude}
    >
      <img style={{ zIndex: 999, width: 30, height: 30 }} src='station.svg' />
    </Marker>
  ))
})

const TaiwanMap = () => {
  const [viewport, setViewport] = useState({
    width: '100%',
    height: '100%',
    latitude: 23.6978,
    longitude: 120.9605,
    zoom: 8
  })
  const [stationData, setStationData] = useState([])
  const [statistic, setStatistic] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  console.log(statistic)
  console.log(statistic.length > 0 ? statistic.reduce((pre, cur) => pre + cur.station_count, 0) : 'not valid')
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    let result = []
    let aggrData = []
    try {
      const res = await axios.get('https://webapi.gogoro.com/api/vm/list')
      const twJson = await axios.get('taiwan_density.json')
      const { data: cityData } = twJson
      const { data: stationData } = res
      // log data
      result = parseStationData(stationData)
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
    setStationData(result)
    setStatistic(aggrData)
    setIsLoading(false)
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
        state: stateMapping[dt.State]
      }
    }).filter(dt => dt.state === '啟用中')
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
        <ReactMapGL
          {...viewport}
          // mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_ACCESS_TOKEN}
          mapStyle='mapbox://styles/yuningc0325/ckmnpe5yalnt817tfwbuf5yeu?optimize=true'
          onViewportChange={nextViewport => setViewport(nextViewport)}
        >
          {stationData.length > 0 ? <StaionMarker arr={stationData} /> : <></>}
        </ReactMapGL>
      }
    </>

    // <div>{stationData.map(o => (<div>{o.locName}</div>))}</div>
  )
}


export default TaiwanMap
