import ReactMarkdown from "react-markdown";
import ReactDOMServer from "react-dom/server";
import React from "react";
import style from "./markdown-renderer.module.css";
import ReactPlayer from "react-player";

interface MarkdownRendererProps {
    children: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = (props) => {
    return (
        <>
            {props.children.split("\n").map((line) => (
                <>
                    {line === "" ? (
                        <div style={{ height: 15 }}></div>
                    ) : (
                        <BaseRenderer
                            parentString={props.children}
                            content={line}
                        />
                    )}
                </>
            ))}
        </>
    );
};

const BaseRenderer: React.FC<{ parentString: string; content: string }> = ({
    parentString,
    content,
}) => (
    <div style={{ display: "flex", flexDirection: "row" }}>
        <ReactMarkdown
            components={{
                a: ({ node, className, children, ...rest }) => (
                    <>
                        {node.position?.start.offset > 0 &&
                        parentString.split("\n")[node.position?.start.line - 1][
                            node.position?.start.column - 2
                        ] === "$" ? (
                            <>
                                <div>
                                    <ReactPlayer controls url={rest.href} />
                                </div>
                            </>
                        ) : (
                            <a href={rest.href}>{children}</a>
                        )}
                    </>
                ),
                pre: ({ node, className, children, ...rest }) => (
                    <pre>{"    "}</pre>
                ),
            }}
            className={style.markdown}
        >
            {content}
        </ReactMarkdown>
    </div>
);
