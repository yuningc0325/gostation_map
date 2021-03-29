import { g0vCityMapping2 } from '../data/mapping'

const SET_STATISTIC_DATA = 'SET_STATISTIC_DATA'
const SET_CURRENT_CITY = 'SET_CURRENT_CITY'

const initialState = {
  statistic: [],
  currentCity: { name: '台北市', value: 'Taipei City' }
}

export const setStatistic = (payload = initialState) => dispatch => {
  if (payload !== null) {
    if (payload.length > 0) {
      dispatch({ type: SET_STATISTIC_DATA, payload: { statistic: payload } })
    }
  }
}

export const setCurrentCity = (currentCity = 'Taipei City') => dispatch => {
  if (currentCity !== null) {
    const data = { value: currentCity, name: g0vCityMapping2[currentCity] }
    const payload = { currentCity: data }
    console.log(payload)
    dispatch({ type: SET_CURRENT_CITY, payload })
  }
}

const dashboardReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_CURRENT_CITY':
    case 'SET_STATISTIC_DATA':
      return Object.assign({}, state, action.payload)
    default:
      return state
  }
}

export default dashboardReducer