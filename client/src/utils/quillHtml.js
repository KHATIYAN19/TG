import { useCallback, useEffect, useRef, useState } from "react";

/*
  Quill 2 (react-quill-new) stores HTML differently from Quill 1:
    - every list becomes ONE <ol>, with <li data-list="bullet|ordered"> and a <span class="ql-ui"> marker
    - code blocks become <div class="ql-code-block-container"><div class="ql-code-block">…</div></div>
  Blog pages, the server-side sanitizer and reply emails all expect the Quill 1 shape
  (<ul>/<ol>, <pre class="ql-syntax">), so editor output is converted back before it is saved.
  Existing posts load into Quill 2 unchanged (it parses the Quill 1 markup itself).

  Deliberately NOT using quill.getSemanticHTML(): that export path is the one flagged by
  GHSA-v3m3-f69x-jf25, and it also rewrites spaces as &nbsp;.
*/
export function quillToLegacyHtml(html) {
  if (!html) return "";
  if (typeof DOMParser === "undefined") return html;
  if (!/data-list=|ql-code-block|ql-ui/.test(html)) return html;

  const doc = new DOMParser().parseFromString(`<body>${html}</body>`, "text/html");
  const body = doc.body;

  body.querySelectorAll("span.ql-ui").forEach((node) => node.remove());

  body.querySelectorAll("ol").forEach((ol) => {
    const items = Array.from(ol.children);
    if (!items.some((li) => li.hasAttribute("data-list"))) return;

    // Split the merged list back into runs: bullet (and checklist) runs -> <ul>, ordered runs -> <ol>
    const frag = doc.createDocumentFragment();
    let current = null;
    let currentTag = null;
    for (const li of items) {
      const tag = li.getAttribute("data-list") === "ordered" ? "ol" : "ul";
      if (tag !== currentTag) {
        current = doc.createElement(tag);
        frag.appendChild(current);
        currentTag = tag;
      }
      li.removeAttribute("data-list");
      current.appendChild(li);
    }
    ol.replaceWith(frag);
  });

  body.querySelectorAll("div.ql-code-block-container").forEach((container) => {
    const pre = doc.createElement("pre");
    pre.className = "ql-syntax";
    pre.setAttribute("spellcheck", "false");
    pre.textContent = Array.from(container.querySelectorAll(".ql-code-block"))
      .map((line) => line.textContent)
      .join("\n");
    container.replaceWith(pre);
  });

  return body.innerHTML;
}

/*
  Keeps Quill's own HTML inside the editor and hands the converted HTML to the parent.
  Feeding the converted HTML straight back into <ReactQuill value> would make it reset its
  contents on every keystroke (the strings never match), which jumps the caret.
*/
export function useLegacyQuillValue(value, onChange) {
  const lastEmitted = useRef(null);
  const [editorValue, setEditorValue] = useState(value || "");

  useEffect(() => {
    if (value !== lastEmitted.current) {
      setEditorValue(value || "");
    }
  }, [value]);

  const handleChange = useCallback(
    (html, ...rest) => {
      setEditorValue(html);
      const out = quillToLegacyHtml(html);
      lastEmitted.current = out;
      onChange?.(out, ...rest);
    },
    [onChange]
  );

  return [editorValue, handleChange];
}
