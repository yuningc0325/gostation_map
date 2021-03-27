import * as d3 from 'd3'

const setDomWithProps =
  (createSvgFunc) => (id = 'gostation_canvas', margin = [10, 10, 10, 10]) => {
    const d3Dom = d3.select(`#${id}`)
    const canvasEle = {}
    canvasEle.id = id
    canvasEle.svgId = id + '_svg'
    canvasEle.groupId = id + '_groupId'
    canvasEle.margin = margin
    canvasEle.width = d3Dom.node().getBoundingClientRect().width - margin[1] - margin[3]
    canvasEle.height = d3Dom.node().getBoundingClientRect().height - margin[0] - margin[2]
    return createSvgFunc(canvasEle)
  }

// set viewbox to show chart under svg area 
const setViewBox = (ele) => {
  const svg = d3.select(`#${ele.id}`).append('svg').attr('viewBox', [0, 0, ele.width, ele.height])
  const newEle = Object.assign({}, ele)
  newEle.svg = svg
  return newEle
}

export const createViewBox = setDomWithProps(setViewBox)

export const clearViewBox = (id) => {
  d3.select(`#${id}`).remove()
}

export const getColorByDist = (x, y, x_mean, y_mean) => {
  // green , red, orange, yellow
  const colorScheme = {
    tr: 'rgba(13,157,3,0.5)',
    tl: 'rgba(250,51,51,0.5)',
    bl: 'rgba(255,172,68,0.5)',
    br: 'rgba(250,234,51,0.5)'
  }
  
  if(x >= x_mean && y >= y_mean) {
    return colorScheme['tr']
  } else if (x < x_mean && y >= y_mean){
    return colorScheme['tl']
  } else if (x < x_mean && y < y_mean){
    return colorScheme['bl']
  } else if (x >= x_mean && y < y_mean) {
    return colorScheme['br']
  } else {
    return colorScheme['tl']
  }
}