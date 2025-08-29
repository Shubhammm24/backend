import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from"../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";


const generateAccessAndRefreshToken = async(userId) => {
    try {
    const user = await User.findById(userId)
    const accessToken = user.generateRefreshToken()
    const refreshToken = user.generateRefreshToken()
     
    user.refreshToken = refreshToken
    await user.save({validateBeforeSave: false})
    
    return {accessToken, refreshToken}


    } catch (error) {
        throw new ApiError(500,"something went wrong while generating refresh and tokens")
        
    }
}






const registerUser = asyncHandler( async (req,res) => {
   // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res

    const{ fullName,email,username,password }= req.body 
    console.log("email:", email );


    /* if(fullName==""){
    //    throw new ApiError(400,"Fullname is required")
     }*/
    
    if(
        [fullName,email,username,password].some((fields) =>
            field?.trim()==="")
     ) {
        throw new ApiError(400,"ALL Fields are required")
    }


    const existedUser = await User.findOne({
        $or: [{username},{email}]
    })
    if(existedUser){
        throw new ApiError(409, "User with email or username already exist")
        
    }

   const avatarLocalPath = req.files?.avatar[0]?.path;
   const coverImageLocalPath = req.files?.coverImage[0]?.path; 
 
   if(!avatarLocalPath){
    throw new ApiError(400,"avatar file is required")
   }

   
   
   const avatar=  await uploadOnCloudinary(avatarLocalPath)
   const coverImage= await uploadOnCloudinary(coverImageLocalPath)
    
    if(!avatarLocalPath){
    throw new ApiError(400,"avatar file is required")
   }

    const user =  await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
   })

   const createdUser = await username.findById(User._id).select(
    "-password -refreshToken "
   )

   if(!createdUser){
    throw new ApiError(500,"something went wrong while registering the user")
   }

   return res.status(201).json(
    new ApiResponse(200, createdUser,"User registered successfully")
   )

})

const  loginUser = asyncHandler( async (req,res)=>{
 // req body —> data
// username or email
// find the user
//password check
//access and referesh token
// send cookie

const {username,email,password} = req.body

if(!username && !email){
    throw new ApiError(400,"username & required")
}

await User.findOne({
    $or: [{username},{email}]


})   

if(!user){
    throw new ApiError(404,"User not found")
}

const isPaaswordValid =  await user.isPaaswordCorrect(password)

if(!isPaaswordValid){
    throw new ApiError(401,"Invalid credentials")
}


const {accessToken,refreshToken} = 
   await  generateAccessAndRefreshToken(user._id)

const loggedInUser = await User.findById(user._Id).select
("-password -refreshToken" )


const option ={
    htttpOnly: true,
    secure: true
}

    return res
    .status(200)
    .cookie("accessToken", refreshToken, option)
    .cookie("refreshToken", refreshToken, option)
    .json( 
        new ApiResponse(
            200,
             {user: loggedInUser, accessToken
               , refreshToken
             },
              "User logged in successfully") )


})


const loggedoutUser = asyncHandler( async (req,res) => {
    User.findByIdAndUpdate(req.user._id,
        {
         $set: { refreshToken: undefined}
        },

        {new: true}
        )

       const options = {
        httpOnly: true,
        secure: true,
       }
    return res
    .status(200)
    .cookie("accessToken", options)
    .cookie("refreshToken",options)
    .json(new ApiResponse(200,null,"User logged out successfully"))

    })


const refreshAccessToken = asyncHandler( async (req,res) => {
      const incomingRefreshToken= req.cookies.
      refreshToken || req.body.refreshToken



      if(!incomingRefreshToken){
        throw new ApiError(401,"unauthorized request")
      }

     try {
         const decodedToken = jwt.verify(
           incomingRefreshToken,
           process.env.REFRESH_TOKEN_SECRET
         )
   
        const user = await User.findById(decodedToken?._id)
   
        if(!user){
           throw new ApiError(401,"invalid refresh token")  
        }
        
        if(incomingRefreshToken !== user?.refreshToken){
           throw new ApiError(401,"Refresh Tokenis expired or used")  
        }
        
        const options ={
           httpOnly: true,
           secure: true,
        }
        
       const {accessToken,newRefreshToken} = await generateAccessAndRefreshToken(user._id)
       
   
        return res
        .status(200)
        .cookie("accessToken",accessToken)
        .cookie("refreshToken",refreshToken,options)
       .json(
           new ApiResponse(
               200,
               {accessToken,RefreshToken: newRefreshToken},
               "Access token refreshed/generated successfully"
           )
       )
     } catch (error) {
        throw new ApiError(401,error?.message || "invalid refresh token")
        
     }


})


export {registerUser,loginUser, loggedoutUser, refreshAccessToken
}