import React from 'react'
import { Outlet } from 'react-router-dom'
import LeftSidebar from './LeftSidebar'

const MainLayout = () => {
  return (
    <div>
         <LeftSidebar/>
        <div className="md:ml-20 lg:ml-[16%] pb-14 md:pb-0">
            <Outlet/>
        </div>
    </div>
  )
}

export default MainLayout