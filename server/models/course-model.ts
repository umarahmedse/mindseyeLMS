import mongoose, { Document, Model, Schema } from "mongoose";
import { title } from "process";
interface InterfaceComment extends Document {
  user: object;
  comment: string;
  commentReplies: InterfaceComment[];
}
interface InterfaceReview extends Document {
  user: object;
  rating: number;
  comment: string;
  commentReplies: InterfaceComment[];
}
interface InterfaceLink extends Document {
  title: string;
  url: string;
}
interface InterfaceCourseData extends Document {
  title: string;
  description: string;
  videoUrl: string;
  videoThumbnail: object;
  videoSection: string;
  videoLength: number;
  videoPlayer: string;
  links: InterfaceLink[];
  suggestion: string;
  questions: InterfaceComment[];
}
interface InterfaceCourse extends Document {
  name: string;
  description: string;
  price: number;
  estimatedPrice?: number;
  thumbnail: object;
  tags: string;
  level: string;
  demoUrl: string;
  benefits: {
    title: string[];
  };
  preRequisites: {
    title: string[];
  };
  reviews: InterfaceReview[];
  courseData: [InterfaceCourseData];
  ratings?: number;
  purchased?: number;
}
const reviewSchema = new Schema<InterfaceReview>({
  user: Object,
  rating: {
    type: Number,
    default: 0,
  },
  comment: String,
});
const linkSchema = new Schema<InterfaceLink>({
  title: String,
  url: String,
});
const commentSchema = new Schema<InterfaceComment>({
  user: Object,
  comment: String,
  commentReplies: [Object],
});
const courseDataSchema = new Schema<InterfaceCourseData>({
  videoUrl: String,
  videoThumbnail: Object,
  title: String,
  videoSection: Object,
  description: String,
  videoLength: Number,
  videoPlayer: String,
  links: [linkSchema],
  suggestion: String,
  questions: [commentSchema],
});
const courseSchema = new Schema<InterfaceCourse>({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  estimatedPrice: {
    type: Number,
    required: false,
  },
  thumbnail: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  tags: {
    type: String,
    required: true,
  },
  level: {
    type: String,
    required: true,
  },
  demoUrl: {
    type: String,
    required: true,
  },
  benefits: [{ title: String }],
  preRequisites: [{ title: String }],
  reviews: [reviewSchema],
  courseData: [commentSchema],
  ratings: {
    type: Number,
    default: 0,
  },
  purchased: {
    type: Number,
    default: 0,
  },
});
const courseModel: Model<InterfaceCourse> = mongoose.model(
  "Course",
  courseSchema
);
export default courseModel;
// 4:38
