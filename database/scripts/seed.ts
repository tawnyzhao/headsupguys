/* eslint-disable @typescript-eslint/no-var-requires */
require("dotenv").config({ path: ".env.local" });
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectId;
const faker = require("faker");

// seed config
const QUESTION_COUNT = 24;
const GROUP_COUNT = 5;
const COMPONENT_COUNT = 60;
const SLIDE_COUNT = 20;
const MODULE_COUNT = 5;
const TOOL_COUNT = 4;

const QUESTIONS_PER_GROUP = Math.floor(QUESTION_COUNT / GROUP_COUNT);
const COMPONENTS_PER_SLIDE = Math.floor(COMPONENT_COUNT / SLIDE_COUNT);
const SLIDES_PER_MODULE = Math.floor(SLIDE_COUNT / MODULE_COUNT);

(async function () {
    const client = new MongoClient(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    try {
        await client.connect();
        console.log("Successfully connected to database");

        const db = client.db(process.env.MONGODB_DB);
        const questionCollection = db.collection("self_check_questions");
        const groupCollection = db.collection("self_check_groups");
        const componentCollection = db.collection("components");
        const slideCollection = db.collection("slides");
        const moduleCollection = db.collection("modules");
        const toolCollection = db.collection("tools");

        if (process.argv[2] != "--init") {
            // destroy previous data
            await Promise.all([
                questionCollection.drop(),
                groupCollection.drop(),
                componentCollection.drop(),
                slideCollection.drop(),
                moduleCollection.drop(),
                toolCollection.drop(),
            ]);
        }

        const questions = await questionCollection.insertMany(mockQuestions());
        const questionIDs = questions.ops.map((x) => x._id);

        const groups = await groupCollection.insertMany(
            mockGroups(questionIDs),
        );
        const groupIDs = groups.ops.map((x) => x._id);

        const components = await componentCollection.insertMany(
            mockComponents(),
        );
        const componentIDs = components.ops.map((x) => x._id);

        const slides = await slideCollection.insertMany(
            mockSlides(componentIDs),
        );
        const slideIDs = slides.ops.map((x) => x._id);

        // need to generate toolIDs beforehand to avoid a circular dependency
        const toolIDs = [];
        for (let i = 0; i < TOOL_COUNT; i++) {
            toolIDs[i] = ObjectId();
        }

        const modules = await moduleCollection.insertMany(
            mockModules(slideIDs, toolIDs),
        );
        const moduleIDs = modules.ops.map((x) => x._id);

        await toolCollection.insertMany(
            mockTools(moduleIDs, groupIDs, toolIDs),
        );

        console.log("Successfully completed seeding");
        client.close();
    } catch (err) {
        console.log(err.stack);
    }
})(); // immediately-invoked function expression

function mockQuestions() {
    const questionTypes = [
        "multiple_choice",
        "multi_select",
        "short_answer",
        "long_answer",
        "slider",
    ];
    const mockOptions = [
        [1, 2, 3],
        ["yes", "no", "maybe"],
    ];

    const alphanumericOptions = [true, false];

    const questions = [];

    for (let i = 0; i < QUESTION_COUNT; i++) {
        questions.push({
            type: questionTypes[i % questionTypes.length],
            question: faker.lorem.words() + faker.lorem.words() + "?",
            options: mockOptions[i % mockOptions.length],
            alphanumericInput:
                alphanumericOptions[i % alphanumericOptions.length],
            questionNumber: (i % QUESTIONS_PER_GROUP) + 1,
        });
    }
    return questions;
}

function mockGroups(questionIDs) {
    const groups = [];
    for (let i = 0; i < GROUP_COUNT; i++) {
        groups.push({
            questionIDs: questionIDs.slice(
                QUESTIONS_PER_GROUP * i,
                QUESTIONS_PER_GROUP * (i + 1),
            ),
        });
    }
    return groups;
}

function mockComponents() {
    const componentTypes = ["text", "video", "audio"];
    const components = [];

    for (let i = 0; i < COMPONENT_COUNT; i++) {
        components.push({
            type: componentTypes[i % componentTypes.length],
            properties: {},
        });
    }
    return components;
}

function mockSlides(componentIDs) {
    const slides = [];

    for (let i = 0; i < SLIDE_COUNT; i++) {
        slides.push({
            componentIDs: componentIDs.slice(
                COMPONENTS_PER_SLIDE * i,
                COMPONENTS_PER_SLIDE * (i + 1),
            ),
        });
    }
    return slides;
}

function mockModules(slideIDs, toolIDs) {
    const statusTypes = ["complete", "published", "draft"];
    const modules = [];

    for (let i = 0; i < MODULE_COUNT; i++) {
        modules.push({
            title: faker.lorem.words(),
            slideIDs: slideIDs.slice(
                SLIDES_PER_MODULE * i,
                SLIDES_PER_MODULE * (i + 1),
            ),
            status: statusTypes[i % statusTypes.length],
            editing: i == 2,
            createdBy: ["John Doe"],
            toolID: i < TOOL_COUNT ? toolIDs[i] : null,
        });
    }
    return modules;
}

function mockTools(moduleIDs, groupIDs, toolIDs) {
    const statusTypes = ["published", "draft"];
    const tools = [];

    for (let i = 0; i < TOOL_COUNT; i++) {
        const relatedToolsIDs = [];
        while (
            relatedToolsIDs.length < Math.floor(Math.random() * TOOL_COUNT) // generate random number of related tools between 0 and (TOOL_COUNT - 1)
        ) {
            const index = Math.floor(Math.random() * TOOL_COUNT);
            // prevent a tool from relating to itself and another tool multiple times
            if (index != i && relatedToolsIDs.indexOf(toolIDs[index]) === -1) {
                relatedToolsIDs.push(String(toolIDs[index]));
            }
        }

        tools.push({
            _id: toolIDs[i],
            title: faker.lorem.words(),
            thumbnail: faker.internet.url(),
            type: faker.lorem.words(),
            video: faker.internet.url(),
            description: faker.lorem.sentences(),
            linkedModuleID: i < MODULE_COUNT ? String(moduleIDs[i]) : undefined,
            relatedResources: [
                [faker.lorem.words(), faker.internet.url()],
                [faker.lorem.words(), faker.internet.url()],
                [faker.lorem.words(), faker.internet.url()],
            ],

            relatedStories: [
                [faker.lorem.words(), faker.internet.url()],
                [faker.lorem.words(), faker.internet.url()],
                [faker.lorem.words(), faker.internet.url()],
            ],
            externalResources: [
                [faker.lorem.words(), faker.internet.url()],
                [faker.lorem.words(), faker.internet.url()],
                [faker.lorem.words(), faker.internet.url()],
            ],
            selfCheckGroupID: i < GROUP_COUNT ? String(groupIDs[i]) : null,
            relatedToolsIDs,
            status: statusTypes[i % statusTypes.length],
            editing: i == 1,
            createdBy: ["John Doe"],
        });
    }
    return tools;
}
