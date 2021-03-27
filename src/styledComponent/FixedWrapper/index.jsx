import React from 'react'

const WrapperStyle = {
  position: 'fixed',
  zIndex: 999,
  width: '100%',
  height: '100%'
}

const FixedWrapper = (props) => {
  const { children, ...prop } = props
  return (
    <div style={{...WrapperStyle, ...prop}}>
      {children}
    </div>
  )
}

export default FixedWrapper
