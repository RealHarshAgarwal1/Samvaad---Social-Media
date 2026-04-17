import { createSlice } from "@reduxjs/toolkit";

const rtnSlice = createSlice({
    name:'realTimeNotification',
    initialState:{
        likeNotification:[], // [1,2,3]
    },
    reducers:{
        setLikeNotification:(state,action)=>{
            if(action.payload.type === 'dislike'){
                state.likeNotification = state.likeNotification.filter((item)=> item.userId !== action.payload.userId);
            } else {
                state.likeNotification.push(action.payload);
            }
        },
        clearLikeNotification:(state)=>{
            state.likeNotification = [];
        }
    }
});
export const {setLikeNotification, clearLikeNotification} = rtnSlice.actions;
export default rtnSlice.reducer;