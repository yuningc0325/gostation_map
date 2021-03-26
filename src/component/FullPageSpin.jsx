import React from 'react'
import { Spin } from 'antd'
import FlexBox from '../styledComponent/FlexBox'
import { LoadingOutlined } from '@ant-design/icons';

const FullPageSpin = props => {
  const actIcon = <LoadingOutlined style={{fontSize: '5em'}} spin/>
  return(
    <FlexBox 
    style={{zIndex: 800}}
    width='100vw'
    height='100vh'
    justifyContent='center'
    alignItems='center'>
      <Spin indicator={actIcon}/>
    </FlexBox>
  )
}

export default FullPageSpin