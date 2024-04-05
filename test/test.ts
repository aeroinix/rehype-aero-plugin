import rehypeSanitize from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import fs from "fs/promises";

import { rehypeAero } from "../lib/exports";

const file = await unified()
  .use(remarkParse)
  .use(remarkRehype)
  .use(rehypeSanitize)
  .use(rehypeStringify)
  .use(rehypeAero)
  .process(await fs.readFile("./test/test.md", "utf-8"));

function htmlWrap(inject: string) {
  return `
  <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    ${inject}
</body>
</html>
  `;
}

await fs.writeFile("./test/test.html", htmlWrap(file.value as string));
