import mongoose, { Document, Model, Schema, model } from "mongoose";
interface InterfaceFaqItem extends Document {
  question: string;
  answer: string;
}
interface InterfaceCategory extends Document {
  title: string;
}
interface InterfaceBannerImage extends Document {
  public_id: string;
  url: string;
}
interface InterfaceLayout extends Document {
  type: string;
  faq: InterfaceFaqItem[];
  categories: InterfaceCategory[];
  banner: {
    image: InterfaceBannerImage[];
    title: string;
    subtitle: string;
  };
}
const faqSchema = new Schema<InterfaceFaqItem>({
  question: {
    type: String,
  },
  answer: {
    type: String,
  },
});
const categorySchema = new Schema<InterfaceCategory>({
  title: {
    type: String,
  },
});
const bannerImageSchema = new Schema<InterfaceBannerImage>({
  public_id: {
    type: String,
  },
  url: {
    type: String,
  },
});
const layoutSchema = new Schema<InterfaceLayout>({
  type: {
    type: String,
  },
  faq: [faqSchema],
  categories: [categorySchema],
  banner: {
    image: [bannerImageSchema],
    title: String,
    subtitle: String,
  },
});
const layoutModel = model<InterfaceLayout>("Layout", layoutSchema);
export default layoutModel;
