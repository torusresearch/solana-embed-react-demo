import React, { ReactNode,FC } from 'react';

const Button: FC<{children?: ReactNode, onClick?: () => void, disabled?: boolean}> = ({children, onClick, disabled=false}) => {
    return (
        <button className='btn-primary' onClick={onClick} disabled={disabled}>
            {children}
        </button>
    )
}

export default Button;
