import React from 'react'
import { Modal } from 'semantic-ui-react'

const BasicModal = ({ open, header, message, close }) => (
  <Modal
    open={open}
    content={message}
    header={header}    
    onClose={() => close()}
    closeIcon
  />
)

export default BasicModal;
