import React from 'react'
import './Groupmodal.style.css'

const Groupmodal = ({ setGroupPopupFlag }: any) => {
    return (
        <>
            <div className="create-group">
                <div className="inside-group">
                    <div className="top-group" onClick={() => setGroupPopupFlag(false)}>
                        <i className='fa-solid fa-xmark'></i>
                    </div>
                    <div className="group-body">
                        <input type="text" placeholder='Search users...' />
                    </div>
                </div>
            </div>
        </>
    )
}
export default Groupmodal


