import React, {
  useMemo,
} from "react";

import ReactQuill from "react-quill";

import "react-quill/dist/quill.snow.css";

const RichTextEditor = ({
  value,
  onChange,
  placeholder = "Write your blog content here...",
  isDark = false,
  disabled = false,
  minHeight = 420,
}) => {
  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [
            {
              header: [
                1,
                2,
                3,
                4,
                5,
                6,
                false,
              ],
            },
          ],

          [
            {
              font: [],
            },

            {
              size: [
                "small",
                false,
                "large",
                "huge",
              ],
            },
          ],

          [
            "bold",
            "italic",
            "underline",
            "strike",
          ],

          [
            {
              color: [],
            },

            {
              background: [],
            },
          ],

          [
            "blockquote",
            "code-block",
          ],

          [
            {
              list:
                "ordered",
            },

            {
              list:
                "bullet",
            },
          ],

          [
            {
              indent: "-1",
            },

            {
              indent: "+1",
            },
          ],

          [
            {
              align: [],
            },
          ],

          [
            {
              script: "sub",
            },

            {
              script: "super",
            },
          ],

          [
            "link",
            "image",
          ],

          ["clean"],
        ],

        handlers: {
          image: function () {
            const imageUrl =
              window.prompt(
                "Enter image URL"
              );

            if (
              !imageUrl ||
              !imageUrl.trim()
            ) {
              return;
            }

            try {
              const parsed =
                new URL(
                  imageUrl.trim()
                );

              if (
                parsed.protocol !==
                  "http:" &&
                parsed.protocol !==
                  "https:"
              ) {
                return;
              }

              const range =
                this.quill.getSelection(
                  true
                );

              this.quill.insertEmbed(
                range.index,
                "image",
                imageUrl.trim(),
                "user"
              );

              this.quill.setSelection(
                range.index + 1,
                0
              );
            } catch {
              window.alert(
                "Please enter a valid http/https image URL."
              );
            }
          },
        },
      },

      history: {
        delay: 1000,
        maxStack: 100,
        userOnly: true,
      },

      clipboard: {
        matchVisual: false,
      },
    }),
    []
  );

  const formats = [
    "header",
    "font",
    "size",

    "bold",
    "italic",
    "underline",
    "strike",

    "color",
    "background",

    "blockquote",
    "code-block",

    "list",
    "bullet",
    "indent",

    "align",

    "script",

    "link",
    "image",
  ];

  return (
    <div
      className={`tt-rich-editor overflow-hidden rounded-2xl border ${
        isDark
          ? "border-slate-700 bg-[#0C131D]"
          : "border-slate-200 bg-white"
      }`}
    >
      <style>
        {`
          .tt-rich-editor .ql-toolbar {
            border: 0 !important;
            border-bottom: 1px solid ${
              isDark
                ? "#334155"
                : "#e2e8f0"
            } !important;
            background: ${
              isDark
                ? "#101924"
                : "#f8fafc"
            };
            padding: 10px 12px;
            display: flex;
            flex-wrap: wrap;
            gap: 3px;
          }

          .tt-rich-editor .ql-container {
            border: 0 !important;
            background: ${
              isDark
                ? "#0C131D"
                : "#ffffff"
            };
            color: ${
              isDark
                ? "#f8fafc"
                : "#0f172a"
            };
            font-size: 15px;
          }

          .tt-rich-editor .ql-editor {
            min-height: ${minHeight}px;
            padding: 18px;
            line-height: 1.8;
          }

          .tt-rich-editor .ql-editor.ql-blank::before {
            color: ${
              isDark
                ? "#64748b"
                : "#94a3b8"
            };
            font-style: normal;
          }

          ${
            isDark
              ? `
                .tt-rich-editor .ql-toolbar .ql-stroke {
                  stroke: #cbd5e1;
                }

                .tt-rich-editor .ql-toolbar .ql-fill {
                  fill: #cbd5e1;
                }

                .tt-rich-editor .ql-toolbar .ql-picker {
                  color: #cbd5e1;
                }

                .tt-rich-editor .ql-toolbar button:hover .ql-stroke,
                .tt-rich-editor .ql-toolbar button.ql-active .ql-stroke {
                  stroke: #60a5fa;
                }

                .tt-rich-editor .ql-toolbar button:hover .ql-fill,
                .tt-rich-editor .ql-toolbar button.ql-active .ql-fill {
                  fill: #60a5fa;
                }

                .tt-rich-editor .ql-toolbar .ql-picker-label:hover,
                .tt-rich-editor .ql-toolbar .ql-picker-label.ql-active {
                  color: #60a5fa;
                }

                .tt-rich-editor .ql-picker-options {
                  background: #101924;
                  border-color: #334155;
                  color: #e2e8f0;
                }

                .tt-rich-editor .ql-snow .ql-picker.ql-expanded .ql-picker-label {
                  border-color: #475569;
                }

                .tt-rich-editor .ql-snow .ql-picker.ql-expanded .ql-picker-options {
                  border-color: #475569;
                }

                .tt-rich-editor .ql-editor pre.ql-syntax {
                  background: #07101f;
                  color: #e2e8f0;
                }

                .tt-rich-editor .ql-editor blockquote {
                  border-left-color: #3b82f6;
                  color: #cbd5e1;
                }
              `
              : ""
          }

          .tt-rich-editor .ql-editor img {
            max-width: 100%;
            height: auto;
            border-radius: 12px;
            margin: 14px auto;
          }

          .tt-rich-editor .ql-editor a {
            color: #2563eb;
            text-decoration: underline;
          }

          .tt-rich-editor .ql-editor h1,
          .tt-rich-editor .ql-editor h2,
          .tt-rich-editor .ql-editor h3 {
            font-weight: 800;
          }

          @media (max-width: 640px) {
            .tt-rich-editor .ql-toolbar {
              padding: 8px;
            }

            .tt-rich-editor .ql-formats {
              margin-right: 4px !important;
            }

            .tt-rich-editor .ql-editor {
              min-height: 340px;
              padding: 14px;
              font-size: 14px;
            }
          }
        `}
      </style>

      <ReactQuill
        theme="snow"
        value={
          value || ""
        }
        onChange={
          onChange
        }
        modules={
          modules
        }
        formats={
          formats
        }
        readOnly={
          disabled
        }
        placeholder={
          placeholder
        }
      />
    </div>
  );
};

export default RichTextEditor;