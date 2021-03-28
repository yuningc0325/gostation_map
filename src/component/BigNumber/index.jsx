import React from 'react'
import { Card, Skeleton, Typography } from 'antd'
import { connect } from 'react-redux'
import FixedWrapper from '../../styledComponent/FixedWrapper'

const BigNumber = ({ dashboard, controller }) => {
  const { isLoading } = controller
  const { statistic } = dashboard
  return (
    <FixedWrapper right={10} top={10} width='200px' hieght='75px'>
      <Card width='100%'>
        <Skeleton loading={isLoading} paragraph={{ rows: 1 }}>
          <Typography>總站數:
          <span>{statistic.length > 0 ? statistic.reduce((pre, cur) => pre + cur.size, 0) : 0}</span>
          </Typography>
        </Skeleton>
      </Card>
    </FixedWrapper>
  )
}

export default connect(({ dashboard, controller }) => ({ dashboard, controller }))(BigNumber)
