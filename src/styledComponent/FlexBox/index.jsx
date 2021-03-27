import React from 'react'
import PropTypes from 'prop-types'

const FlexBox = (
  {
    justifyContent = 'center',
    alignItems = 'center',
    flexDirection='row',
    width = 'auto',
    height = 'auto',
    children
  }
) => {
  return (
    <div style={{
      display: 'flex',
      justifyContent,
      flexDirection,
      alignItems,
      width,
      height,
    }}>
      {children}
    </div>
  )
}

FlexBox.propTypes = {
  justifyContent: PropTypes.string,
  alignItems: PropTypes.string,
  flexDirection: PropTypes.string,
  width: PropTypes.string,
  height: PropTypes.string,
  children: PropTypes.node
}

FlexBox.defaultProps = {
  justifyContent: 'center',
  alignItems: 'center',
  flexDirection: 'column',
  width: 'auto',
  height: 'auto',
  children: () => {<></>}
}

export default FlexBox