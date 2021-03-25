import { head, countBy, groupBy } from 'lodash'

export const sum = (a, b) => a+b

export const getSecondItemFromArray = (arr=[]) => {
  if(arr.length === 0) return null
  return head(arr.slice().reverse())
}

export const countby = (arr=[], by='id') => {
  if(arr.length === 0) return []
  const countGroup = countBy(arr, by)
  const keys = Object.keys(countGroup)
  const sum = Object.values(countGroup).reduce((pre, cur) => pre + cur, 0)
  const result = keys.map(dt => ({
    [by]: dt,
    count: countGroup[dt],
    ratio: parseFloat((countGroup[dt]/sum).toFixed(3))
  }))
  return groupBy(result, by)
}
