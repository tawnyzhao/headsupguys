import React, { useState } from "react";
import {
    Flex,
    Text,
    Button,
    Spacer,
    SimpleGrid,
    Stack,
    Box,
    useDisclosure,
    Slide,
    VStack,
    Grid,
    Heading,
    HStack,
    Center,
    Container,
    IconButton,
    ButtonGroup,
} from "@chakra-ui/react";
import { IoIosUndo, IoIosRedo } from "react-icons/io";
import { IoTrash } from "react-icons/io5";

import { Page } from "types/Page";
import { BuilderLayout, MarkdownEditor, MarkdownRenderer } from "@components";

const Builder: Page = () => {
    const { isOpen: isSidebarOpen, onToggle: toggleSidebar } = useDisclosure();
    const [editorText, setEditorText] = useState("Hello world!");
    const [slideNumber, setSlide] = useState(1);
    const [maxSlides, addSlide] = useState(1);

    const moduleName = "Untitled Module";
    return (
        <Stack spacing={0}>
            <Stack spacing={2} p={6}>
                <Box>
                    <Button variant="link">{"<"} Exit Builder</Button>
                </Box>
                <Flex>
                    <Heading>{moduleName}</Heading>
                    <Spacer />
                    <HStack spacing={2}>
                        <Button variant="outline"> Discard </Button>
                        <Button> Save </Button>
                    </HStack>
                </Flex>
            </Stack>
            <Flex
                px={2}
                py={4}
                alignItems="center"
                border="1px"
                borderColor="black"
            >
                <Button
                    onClick={() => {
                        setSlide(slideNumber + 1);
                        addSlide(maxSlides + 1);
                        setEditorText("");
                    }}
                >
                    New Slide
                </Button>
                <Spacer />
                <Box>
                    {slideNumber}/{maxSlides} Slides
                </Box>
                <Spacer />
                <ButtonGroup variant="ghost">
                    <IconButton aria-label="undo" icon={<IoIosUndo />} />
                    <IconButton aria-label="redo" icon={<IoIosRedo />} />
                    <IconButton aria-label="trash" icon={<IoTrash />} />
                </ButtonGroup>
            </Flex>
            <Flex h="80vh">
                <Box w={isSidebarOpen ? "60%" : "5%"} transition="all 0.25s">
                    <Flex bg={isSidebarOpen ? "black" : "white"}>
                        <Spacer />
                        <Button
                            variant={isSidebarOpen ? "solid" : "ghost"}
                            colorScheme="blackAlpha"
                            onClick={toggleSidebar}
                        >
                            {isSidebarOpen ? "<<" : ">>"}
                        </Button>
                    </Flex>
                    {isSidebarOpen && (
                        <Container maxW="70%" py={4}>
                            <Stack spacing={2}>
                                <Heading>Section {slideNumber}</Heading>
                                <MarkdownEditor
                                    value={editorText}
                                    setValue={setEditorText}
                                />
                            </Stack>
                        </Container>
                    )}
                </Box>
                <VStack flex="1" bg="gray.200">
                    <Box
                        w="80%"
                        minH="80%"
                        border="1px"
                        borderColor="gray.700"
                        boxShadow="md"
                        overflow="auto"
                        px={4}
                        py={8}
                        bg="white"
                        mt={4}
                    >
                        <MarkdownRenderer>{editorText}</MarkdownRenderer>
                    </Box>
                </VStack>
            </Flex>
        </Stack>
    );
};

Builder.layout = BuilderLayout;

export default Builder;
