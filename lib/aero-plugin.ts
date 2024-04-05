// @ts-nocheck
import { visit } from "unist-util-visit";
import { toMdast } from "hast-util-to-mdast";
import { getHighlighter, bundledLanguages } from "shiki";

import type { HastRoot } from "remark-rehype/lib";

const shiki = await getHighlighter({
  themes: ["material-theme-palenight", "min-light"],
  langs: [...Object.keys(bundledLanguages)],
});

const FALLBACK_LANGUAGE = "text";

// TODO
// Add fallback language on code blocks so it doesn't crash
// Look into custom properties on the code blocks for different cool stylings

export function rehypeAero() {
  return async (tree: HastRoot) => {
    let i = 0;
    visit(tree, "element", (node, index, parent) => {
      if (node.tagName === "pre" && parent) {
        const codeNode = node.children.find(
          (child) => child.tagName === "code",
        );

        // Need to parse the meta data and inject html class attributes on the lines/text
        const meta = codeNode?.data.meta;

        if (codeNode) {
          // convert the node to Mdast format to pull the syntax language for shiki and the html span
          const codeMdast = toMdast(node);
          // grab the code block text and trim any white space off the end
          const codeBlock = codeNode.children[0].value.trimEnd();

          // style the code block with shiki
          const styledCodeBlock = shiki.codeToHast(codeBlock, {
            lang: codeMdast.lang,
            themes: {
              light: "min-light",
              dark: "material-theme-palenight",
            },
            cssVariablePrefix: "--theme-",
            defaultColor: "",
            transformers: [
              {
                pre(hast) {
                  return {
                    type: "element",
                    tagName: "pre",
                    properties: {
                      className: "aero",
                    },
                    children: hast.children,
                  };
                },
                line(hast, line) {
                  // console.log("line", line);

                  return {
                    type: "element",
                    tagName: "span",
                    properties: {
                      className: "line",
                    },
                    children: hast.children,
                  };
                },
                span(hast, line) {
                  return {
                    type: "element",
                    tagName: "span",
                    properties: hast.properties,
                    children: hast.children,
                  };
                },
              },
            ],
          });

          const spanNode = {
            type: "element",
            tagName: "span",
            properties: {
              className: "language-name",
            },
            children: [{ type: "text", value: `${codeMdast.lang}` }],
          };

          const divNode = {
            type: "element",
            tagName: "div",
            properties: {
              className: `code-block ${codeMdast.lang}`,
            },
            children: [spanNode, styledCodeBlock],
          };

          parent.children.splice(index, 1, divNode);
        }
      }
    });
  };
}
