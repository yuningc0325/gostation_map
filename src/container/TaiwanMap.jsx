import React, { useEffect, useState } from 'react'
import ReactMapGL, { Marker } from 'react-map-gl'
import { groupBy } from 'lodash'
import { getSecondItemFromArray, countby } from '../utils'
import axios from 'axios'

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

const StaionMarker = React.memo(({arr}) => {
  console.log('MARKER RENDER')
  console.log(arr)
  return arr.map(station => (
    <Marker
      key={station.rid}
      latitude={station.latitude}
      longitude={station.longitude}
    >
      <img style={{zIndex: 999, width:30, height:30}} src='station.svg'/>
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
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    let result = []
    let aggrData = {}
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
        if(!resultInGroup[dt.city]) return {}
        const {
          count: station_count,
          ratio: station_ratio
        } = resultInGroup[dt.city][0]
        console.log(resultInGroup[dt.city][0])
        return {
          ...dt,
          station_density: station_count ? (station_count / dt.area) : 0,
          station_count,
          station_ratio
        }
      })
    } catch (err) {
      console.log(err)
      alert('Something Went Wrong')
    }
    setStationData(result)
    setStatistic(aggrData)
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
    <ReactMapGL
      {...viewport}
      mapboxApiAccessToken='pk.eyJ1IjoieXVuaW5nYzAzMjUiLCJhIjoiY2ttbm96MGs0MDQ5NzJubWdrNnZkM2pvcyJ9.m5pyg4oP7RiLkDkOLYJW0w'
      mapStyle='mapbox://styles/yuningc0325/ckmnpe5yalnt817tfwbuf5yeu?optimize=true'
      onViewportChange={nextViewport => setViewport(nextViewport)}
    >
      {stationData.length > 0 ? <StaionMarker arr={stationData}/> : <></>}
    </ReactMapGL>  

    // <div>{stationData.map(o => (<div>{o.locName}</div>))}</div>
  )
}


export default TaiwanMap
