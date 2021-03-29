import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { Card, Typography } from 'antd'
import FixedWrapper from '../../styledComponent/FixedWrapper'
import { createViewBox, getCustomedColor, clearViewBox } from '../../utils/d3-controller'
import * as d3 from 'd3'
import FlexBox from '../../styledComponent/FlexBox'
import { setCurrentCity } from '../../reducer/dashboard'
import { connect } from 'react-redux'

const Info = props => {
  const { Text, } = Typography
  const { city, dataset } = props
  if (dataset.length === 0 || !city) return <></>

  const name = city.name
  const filteredArr = dataset.filter(dt => dt.name === city.value)[0]
  const count = filteredArr ? filteredArr['size'] : 0
  const ratio = filteredArr ? filteredArr['size_ratio'] : 0
  return (
    <>
      <h3>{name}</h3>
      <Text type='secondary'>
        目前總共有<Text strong>{count}</Text>個充電站，
        佔總台灣充電站百分之<Text strong>{d3.format('.0%')(ratio)}</Text>
      </Text>
    </>
  )
}

const MetrixChart = props => {
  const { dashboard,  setCurrentCity } = props
  const { statistic: dataset, currentCity } = dashboard

  const [d3View, setd3View] = useState(null)
  useEffect(() => {
    const viewbox = createViewBox('go-scatter-plot', [25, 10, 60, 40])
    viewbox.svg.append('svg').attr('id', viewbox.svgId)
    setd3View(viewbox)
  }, [])
  
  useEffect(() => {
    if (!dataset) return
    if (dataset.length === 0) return
    // draw
    const { svgId, width, height, margin, svg } = d3View
    // console.log('d3 currentCity.value' ,currentCity.value)
    clearViewBox(svgId)
    const _svg = svg.append('svg').attr('id', svgId)
    _svg.append('g')
      .append('text')
      .attr('x', width * 0.5)
      .attr('y', 15)
      .attr('text-anchor', 'middle')
      .text('GoStation與人口密度矩陣')
    const xScale = d3.scaleLinear()
      .domain(d3.extent(dataset, d => d['x']))
      .range([margin[3], width - margin[1]])
    const yScale = d3.scaleLinear()
      .domain(d3.extent(dataset, d => d['y']))
      .range([height - margin[2], margin[0]])
    const xAxis = d3.axisBottom(xScale).ticks()
    const yAxis = d3.axisLeft(yScale).ticks().tickFormat(d3.format(".0s"))
    // create x

    const xGroup = _svg.append('g')
      .attr('transform', `translate(0, ${height - margin[2]})`)
      .attr('color', '#828282')
      .attr('stroke-width', 1)

    xGroup.call(xAxis)
    xGroup.select('.domain').remove()
    xGroup.append('text')
      .attr('x', width)
      .attr('y', margin[2] - 20)
      .attr('fill', 'currentColor')
      .attr('text-anchor', 'end')
      .text('充電站密度(數量 / km2)')

    const yGroup = _svg.append('g')
      .attr('transform', `translate(${margin[3]}, 0)`)
      .attr('color', '#828282')
      .attr('stroke-width', 1)

    yGroup.call(yAxis)
    yGroup.select('.domain').remove()
    yGroup.append('text')
      .attr('x', 0)
      .attr('y', -margin[3] + 10)
      .attr('fill', 'currentColor')
      .attr('text-anchor', 'end')
      .attr('transform', 'rotate(-90)')
      .text('人口密度(數量 / km2)')

    const grid = _svg.append('g')
      .attr('stroke', 'currentColor')
      .attr('stroke-opacity', 0.2)
    grid.append('g')
      .selectAll('line')
      .data(xScale.ticks())
      .join('line')
      .attr('x1', d => xScale(d))
      .attr('x2', d => xScale(d))
      .attr('y1', margin[0])
      .attr('y2', height - margin[2])
    grid.append('g')
      .selectAll('line')
      .data(yScale.ticks())
      .join('line')
      .attr('y1', d => yScale(d))
      .attr('y2', d => yScale(d))
      .attr('x1', margin[3])
      .attr('x2', width - margin[1])

    _svg.append('g')
      .selectAll("circle")
      .data(dataset)
      .join("circle")
      .attr('cx', d => xScale(d['x']))
      .attr('cy', d => yScale(d['y']))
      .attr('r', d => Math.log(d.size) * 3)
      .attr("fill", d => getCustomedColor(d.quadrant, d.name === currentCity.value))
      .attr('stroke', d => getCustomedColor(d.quadrant, d.name === currentCity.value))
      .attr('style', 'cursor: pointer')
      .on('click', (eve, d) => { 
        eve.stopPropagation()
        setCurrentCity(d.name)
       })
      

  }, [d3View, dataset, setCurrentCity, currentCity.value])


  return (
    <FixedWrapper width='450px' height='400px' bottom={0} left={0}>
      <Card style={{ height: '450px', width: '500px' }}>
        <FlexBox flexDirection='column' width='100%' height='450px' alignItems='center' justifyContent='space-around'>
          <div sytle={{ height: '50px', width: '450px' }}>
            {currentCity.value &&
              <Info city={currentCity} dataset={dataset} />
            }
          </div>
          <div style={{ height: '300px', width: '85%' }} id='go-scatter-plot' />
        </FlexBox>

      </Card>
    </FixedWrapper>
  )
}

MetrixChart.propTypes = {
  dataset: PropTypes.any
}

MetrixChart.defaultProps = {
  dataset: [
    { 'name': 'Changhua County', 'x': 0.0698066634648677, 'y': 1179, 'size': 75, isSelected: false },
    { 'name': 'Chiayi City', 'x': 0.4164889647083911, 'y': 4432, 'size': 25, isSelected: false },
    { 'name': 'Chiayi County', 'x': 0.014183378582688599, 'y': 262, 'size': 27, isSelected: false },
    { 'name': 'Hsinchu City', 'x': 0.7296985384906377, 'y': 4334, 'size': 76, isSelected: false },
    { 'name': 'Hsinchu County', 'x': 0.042030437181693865, 'y': 400, 'size': 60, isSelected: false },
    { 'name': 'Hualien County', 'x': 0.009290123514136566, 'y': 70, 'size': 43, isSelected: false },
    { 'name': 'Kaohsiung City', 'x': 0.13652444139822167, 'y': 937, 'size': 403, isSelected: false },
    { 'name': 'Keelung City', 'x': 0.1431165820144638, 'y': 2769, 'size': 19, isSelected: false },
    { 'name': 'Miaoli County', 'x': 0.02197421995501987, 'y': 298, 'size': 40, isSelected: false },
    { 'name': 'Nantou County', 'x': 0.0075491253242471095, 'y': 120, 'size': 31, isSelected: false },
    { 'name': 'New Taipei City', 'x': 0.24311024825648786, 'y': 1964, 'size': 499, isSelected: false },
    { 'name': 'Penghu County', 'x': 0.0472947035449745, 'y': 835, 'size': 6, isSelected: false },
    { 'name': 'Pingtung County', 'x': 0.0342268301383308, 'y': 293, 'size': 95, isSelected: false },
    { 'name': 'Taichung City', 'x': 0.20316973684733303, 'y': 1274, 'size': 450, isSelected: false },
    { 'name': 'Tainan City', 'x': 0.13551414683281765, 'y': 855, 'size': 297, isSelected: false },
    { 'name': 'Taipei City', 'x': 0.8130987635380025, 'y': 9575, 'size': 221, isSelected: false },
    { 'name': 'Taitung County', 'x': 0.005689491560293562, 'y': 61, 'size': 20, isSelected: false },
    { 'name': 'Taoyuan City', 'x': 0.21458629891052408, 'y': 1858, 'size': 262, isSelected: false },
    { 'name': 'Yilan County', 'x': 0.01912647878586605, 'y': 211, 'size': 41, isSelected: false },
    { 'name': 'Yunlin County', 'x': 0.02943836404503574, 'y': 524, 'size': 3, isSelected: false }
  ]
}

export default connect(({ dashboard }) => ({ dashboard }), { setCurrentCity })(MetrixChart)
