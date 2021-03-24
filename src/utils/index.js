import head from 'lodash/head'

export const sum = (a, b) => a+b

export const getSecondItemFromArray = (arr=[]) => {
  if(arr.length === 0) return null
  return head(arr.slice().reverse())
}
