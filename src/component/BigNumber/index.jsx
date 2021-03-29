import React from 'react'
import { Skeleton, Typography } from 'antd'
import { connect } from 'react-redux'
import FixedWrapper from '../../styledComponent/FixedWrapper'
import FlexBox from '../../styledComponent/FlexBox'

const BigNumber = ({ dashboard, controller }) => {
  const { isLoading } = controller
  const { statistic } = dashboard
  const { Text } = Typography
  return (
    <FixedWrapper right={10} top='5%' width='200px' hieght='75px'>
      <FlexBox flexDirection='column'>
        <Skeleton loading={isLoading} paragraph={{ rows: 1 }}>
          <Text style={{ color: 'white', fontSize: '2em' }}>
            總站數
          </Text>
          <Text style={{ color: 'white', fontSize: '1.5em' }}>
            {statistic.length > 0 ? statistic.reduce((pre, cur) => pre + cur.size, 0) : 0}
          </Text>
        </Skeleton>
      </FlexBox>
    </FixedWrapper>
  )
}

export default connect(({ dashboard, controller }) => ({ dashboard, controller }))(BigNumber)
