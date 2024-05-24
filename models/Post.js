import mongoose from "mongoose";

const PostSchema = new mongoose.Schema({
    info_kg: {
        title: String,
        text: String
    },
    info_ru: {
        title: {
            type: String,
            required: true
        },
        text: {
            type: String,
            required: true
        }
    },
    info_en: {
        title: String,
        text: String
    },
    tags: {
        type: [String],
        default: []
    },
    viewsCount: {
        type: Number,
        default: 0
    },
    commentsCount: {
        type: Number,
        default: 0
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    imageUrl: String
}, {
    timestamps: true
});

export default mongoose.model("Post", PostSchema);
