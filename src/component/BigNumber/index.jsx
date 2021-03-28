import React, { useEffect, useState } from 'react'
import { Card, Skeleton, Typography } from 'antd'
import PropTypes from 'prop-types'
import FixedWrapper from '../../styledComponent/FixedWrapper'

const BigNumber = ({ dataset }) => {
  useEffect(() => {
    setIsLoading(false)
  }, [])
  const [isLoading, setIsLoading] = useState(true)
  return (
    <FixedWrapper right={10} top={10} width='200px' hieght='75px'>
      <Card width='100%'>
        <Skeleton loading={isLoading} paragraph={{ rows: 1 }}>
          <Typography>總站數:
          <span>{dataset.reduce((pre, cur) => pre + cur.size, 0)}</span>
          </Typography>
        </Skeleton>
      </Card>
    </FixedWrapper>
  )
}

BigNumber.propTypes = {
  dataset: PropTypes.arrayOf(PropTypes.instanceOf({
    size: PropTypes.number.isRequired
  }))
}

BigNumber.defaultProps = {
  dataset: [{ size: 0 }]
}

export default BigNumber
