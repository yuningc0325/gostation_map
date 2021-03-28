const SET_STATISTIC_DATA = 'SET_STATISTIC_DATA'
const SET_CURRENT_CITY = 'SET_CURRENT_CITY'

const initialState = {
  statistic: [],
  currentCity: {name:'', value:''}
}

export const setStatistic = (payload = initialState) => dispatch => {
  console.log('*** payload', payload)
  if (payload !== null) {
    if (payload.length > 0) {
      dispatch({ type: SET_STATISTIC_DATA, payload: { statistic: payload } })
    }
  }
}

export const setCurrentCity = (currentCity = initialState.currentCity) => dispatch => {
  if (currentCity !== null) {
    if(Object.values(currentCity).length > 0)
    dispatch({ type: SET_CURRENT_CITY, payload: { currentCity } })
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