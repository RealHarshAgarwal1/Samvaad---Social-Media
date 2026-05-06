import {createSlice} from "@reduxjs/toolkit"

const authSlice = createSlice({
    name:"auth",
    initialState:{
        user:null,
        suggestedUsers:[],
        userProfile:null,
        selectedUser:null,
        taggedPosts:[],
    },
    reducers:{
        // actions
        setAuthUser:(state,action) => {
            state.user = action.payload;
        },
        setSuggestedUsers:(state,action) => {
            state.suggestedUsers = action.payload;
        },
        setUserProfile:(state,action) => {
            state.userProfile = action.payload;
        },
        setSelectedUser:(state,action) => {
            state.selectedUser = action.payload;
        },
        setTaggedPosts:(state,action) => {
            state.taggedPosts = action.payload;
        }
    }
});
export const {
    setAuthUser, 
    setSuggestedUsers, 
    setUserProfile,
    setSelectedUser,
    setTaggedPosts,
} = authSlice.actions;
export default authSlice.reducer;