import React from 'react'
import PropTypes from 'prop-types'

const FlexBox = (
  {
    justifyContent = 'center',
    alignItems = 'center',
    width = 'auto',
    height = 'auto',
    children
  }
) => {
  return (
    <div style={{
      display: 'flex',
      justifyContent,
      alignItems,
      width,
      height
    }}>
      {children}
    </div>
  )
}

FlexBox.propTypes = {
  justifyContent: PropTypes.string,
  alignItems: PropTypes.string,
  width: PropTypes.string,
  height: PropTypes.string,
  children: PropTypes.node
}

FlexBox.defaultProps = {
  justifyContent: 'center',
  alignItems: 'center',
  width: 'auto',
  height: 'auto',
  children: () => {<></>}
}

export default FlexBox