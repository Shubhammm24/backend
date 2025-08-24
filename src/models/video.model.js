import mongoose, {schema} from"mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
    {
      videoFile: {
        type: string,
        required: true,

      },
       thumbnail: {
        type: string,
        required: true,
      },

       title: {
        type:string,
        required: true,

      },

       description: {
        type:string,
        required: true,

      },

       duration: {
        type: number,
        required: true,

      },

       views: {
        type: number,
        default: 0,

      },

       isPublished: {
        type: Boolean,
        default: true,

      },

       owner: {
        type: Schema.Type.ObjectId,
        ref: "User"

      },



    },
    {
        timestamp: true,
    },
)

videoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model("Video",videoSchema)