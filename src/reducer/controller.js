const SET_ISLOADING = 'SET_ISLOADING'

const initialState = {
  isLoading: true
}

export const setIsLoading = (isLoading=false) => dispatch => {
  if (isLoading !== null) {
    dispatch({ type: SET_ISLOADING, payload: {isLoading} })
  }
}

const controllerReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_ISLOADING':
      return Object.assign({}, state, action.payload)
    default:
      return state
  }
}

export default controllerReducer