import { combineReducers } from 'redux'
import dashboard from './dashboard'
import controller from './controller'
export default combineReducers({
  controller,
  dashboard
})