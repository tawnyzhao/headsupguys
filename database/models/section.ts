import { models, model, Schema, Types } from "mongoose";
import { OptionsQuestion } from "pages/admin/dashboard/builder";
enum SectionType {
    MARKDOWN = "markdown",
    MULTIPLECHOICE = "mc",
    MULTISELECT = "ms",
    SHORTANSWER = "sa",
}

export interface SectionInterface {
    _id: Types.ObjectId;
    type: SectionType;
    padding: string;
    markdown: string;
    multipleChoice: OptionsQuestion;
    multiSelect: OptionsQuestion;
    alignment: string;
    properties: any;
}

const SectionSchema = new Schema<SectionInterface>(
    {
        type: {
            type: SectionType,
            required: true,
        },
        padding: {
            top: Number,
            bottom: Number,
            right: Number,
            left: Number,
        },
        markdown: {
            type: String,
        },
        multipleChoice: {
            type: Object,
        },
        multiSelect: {
            type: Object,
        },
        alignment: {
            type: String,
        },
        properties: {
            type: Schema.Types.Mixed,
        },
    },
    {
        timestamps: true,
    },
);

export { SectionSchema };
