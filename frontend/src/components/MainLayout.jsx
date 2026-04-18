import React from 'react'
import { Outlet } from 'react-router-dom'
import LeftSidebar from './LeftSidebar'

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-[#fafafa]">
         <LeftSidebar/>
        <div className="md:ml-20 lg:ml-64 pb-16 md:pb-0 min-h-screen">
            <Outlet/>
        </div>
    </div>
  )
}

export default MainLayout