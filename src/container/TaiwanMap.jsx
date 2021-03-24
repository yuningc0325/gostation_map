import React, { useEffect, useState } from 'react'
import { getSecondItemFromArray } from '../utils'
import axios from 'axios'

const stateMapping = {
  100: '準備啟用中',
  1: '啟用中',
  98: '維修中',
  99: '測試中',
}

const TaiwanMap = () => {
  const [stationData, setStationData] = useState([])
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    let result = []
    try {
      const res = await axios.get('https://webapi.gogoro.com/api/vm/list')
      const { data } = res
      console.log('***', data)
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
        state: stateMapping[dt.State]
      }
    })
  }

  

  return (
    <div>{stationData.map(o => (<div>{o.locName}</div>))}</div>
  )
}


export default TaiwanMap
