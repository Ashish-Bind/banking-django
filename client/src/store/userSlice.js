import {createSlice } from '@reduxjs/toolkit'

const initialState = {
    avatar:'https://avatars.githubusercontent.com/u/121487855?v=4',
    name:'Ashish Bind',
    role: 'user'
}

export const logout = () => {}

const userSlice = createSlice({
    name:'User',
    initialState:initialState,
    reducers:{

    }
})

export default userSlice.reducer