import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { CSidebar, CSidebarBrand, CSidebarNav, CSidebarToggler, CImage } from '@coreui/react'
import { AppSidebarNav } from './AppSidebarNav'
import SimpleBar from 'simplebar-react'
import 'simplebar/dist/simplebar.min.css'
import ocs from './../assets/images/OCS.png'
import navigationAdmin from '../_navAdmin'

/**
 * @component AppSidebarAdmin
 * @description Component for vertical admin nav bar.
 */
const AppSidebarAdmin = () => {
  const dispatch = useDispatch()
  const unfoldable = useSelector((state) => state.sidebarUnfoldable)
  const sidebarShow = useSelector((state) => state.sidebarShow)

  return (
    <CSidebar
      position="fixed"
      unfoldable={unfoldable}
      visible={sidebarShow}
      onVisibleChange={(visible) => {
        dispatch({ type: 'set', sidebarShow: visible })
      }}
    >
      <CSidebarBrand className="d-none d-md-flex" to="/"
       style={{backgroundColor: '#279b48'}}>
        <CImage fluid src={ocs} style={{padding:"8px"}} alt="Logo" />
      </CSidebarBrand> 
      <CSidebarNav style={{backgroundColor: '#52af6d'}}>
        <SimpleBar>
          <AppSidebarNav items={navigationAdmin} />
        </SimpleBar>
      </CSidebarNav>
      <CSidebarToggler style={{backgroundColor: '#279b48'}}
        className="d-none d-lg-flex"
        onClick={() => dispatch({ type: 'set', sidebarUnfoldable: !unfoldable })}
      />
    </CSidebar>
  )
}

export default React.memo(AppSidebarAdmin)
