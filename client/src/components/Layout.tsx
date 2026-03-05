import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

import React from 'react'

export default function Layout() {
  return (
    <>
    <Navbar />
    <div>
        <Outlet />
    </div>
    </>
  )
}