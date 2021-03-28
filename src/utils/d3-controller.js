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
  const svg = d3.select(`#${ele.id}`)
  .append('svg')
  .attr('viewBox', [0, 0, ele.width, ele.height])
  .attr('id', `${ele.id + '_viewbox'}`)
  const newEle = Object.assign({}, ele)
  newEle.svg = svg
  return newEle
}

export const createViewBox = setDomWithProps(setViewBox)

export const clearViewBox = (id) => {
  d3.select(`#${id}`).remove()
}

// get color by quadrant and isSelected
// if this node is selected than return deeper color
export const getCustomedColor = (quadrant = 0, isSelected) => {
  // green , red, orange, yellow
  const colorScheme = {
    0: 'rgb(255,255,255,%%opc%%)',
    1: 'rgba(13,157,3,%%opc%%)',
    2: 'rgba(250,51,51,%%opc%%)',
    3: 'rgba(255,172,68,%%opc%%)',
    4: 'rgba(250,234,51,%%opc%%)'
  }
  return colorScheme[quadrant].replace('%%opc%%', isSelected ? '0.9' : '0.1')
}