import React, { useEffect, useState } from 'react'
import ReactMapGL, { Marker } from 'react-map-gl'
import { getSecondItemFromArray } from '../utils'
import axios from 'axios'

const stateMapping = {
  100: '準備啟用中',
  1: '啟用中',
  98: '維修中',
  99: '測試中',
}

const TaiwanMap = () => {
  const [viewport, setViewport] = useState({
    width: '100%',
    height: '100%',
    latitude: 23.6978,
    longitude: 120.9605,
    zoom: 8
  })
  const [stationData, setStationData] = useState([])
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    let result = []
    try {
      const res = await axios.get('https://webapi.gogoro.com/api/vm/list')
      const { data } = res
      result = parseStationData(data)
    } catch (err) {
      console.log(err)
      alert('Something Went Wrong')
    }
    console.log(result)
    setStationData(result)
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
      // mapStyle='mapbox://styles/yuningc0325/ckmnpe5yalnt817tfwbuf5yeu?optimize=true'
      onViewportChange={nextViewport => setViewport(nextViewport)}
    >
      {stationData.length > 0 ? stationData.map(station => (
        <Marker
          key={station.rid}
          latitude={station.latitude}
          longitude={station.longitude}
        >
          <img style={{zIndex: 999, width:10, height:10}} src='station.svg'/>
        </Marker>
      )): <></>}

    </ReactMapGL>  
      
    // <div>{stationData.map(o => (<div>{o.locName}</div>))}</div>
  )
}


export default TaiwanMap
