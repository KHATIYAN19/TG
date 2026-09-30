// import React, { useMemo, useRef, useState } from "react";
// import { Helmet } from "react-helmet";
// import { toast } from "react-hot-toast";
// import {
//   Bold,
//   BriefcaseBusiness,
//   Building2,
//   CalendarDays,
//   CheckCircle2,
//   ChevronDown,
//   CircleUserRound,
//   Clock3,
//   Code2,
//   Eye,
//   FileText,
//   Globe2,
//   Heading1,
//   Heading2,
//   Italic,
//   Link2,
//   List,
//   ListOrdered,
//   Mail,
//   MapPin,
//   Minus,
//   Pencil,
//   Phone,
//   Pilcrow,
//   Quote,
//   Send,
//   ShieldCheck,
//   Sparkles,
//   Strikethrough,
//   UserRound,
// } from "lucide-react";

// import BASE_URL from "../utils/Url.js";

// const initialForm = {
//   title: "",
//   company: "",
//   role: "",

//   name: "",
//   email: "",
//   mobile: "",

//   isAnonymous: true,
//   publicName: "",

//   experienceYears: "",
//   experienceMonths: "",

//   location: "",
//   country: "India",

//   interviewDate: "",
//   applicationSource: "",

//   interviewMode: "NOT_SPECIFIED",
//   difficulty: "NOT_SPECIFIED",
//   result: "NOT_DISCLOSED",

//   content: "",
// };

// const interviewModes = [
//   {
//     value: "NOT_SPECIFIED",
//     label: "Not specified",
//   },
//   {
//     value: "ONLINE",
//     label: "Online",
//   },
//   {
//     value: "OFFLINE",
//     label: "Offline",
//   },
//   {
//     value: "HYBRID",
//     label: "Hybrid",
//   },
// ];

// const difficultyOptions = [
//   {
//     value: "NOT_SPECIFIED",
//     label: "Not specified",
//   },
//   {
//     value: "EASY",
//     label: "Easy",
//   },
//   {
//     value: "MEDIUM",
//     label: "Medium",
//   },
//   {
//     value: "MEDIUM_HARD",
//     label: "Medium-Hard",
//   },
//   {
//     value: "HARD",
//     label: "Hard",
//   },
// ];

// const resultOptions = [
//   {
//     value: "NOT_DISCLOSED",
//     label: "Prefer not to say",
//   },
//   {
//     value: "SELECTED",
//     label: "Selected",
//   },
//   {
//     value: "REJECTED",
//     label: "Rejected",
//   },
//   {
//     value: "WAITING",
//     label: "Waiting for result",
//   },
//   {
//     value: "OFFER_DECLINED",
//     label: "Offer declined",
//   },
// ];

// const applicationSourceOptions = [
//   {
//     value: "",
//     label: "Select source",
//   },
//   {
//     value: "Referral",
//     label: "Referral",
//   },
//   {
//     value: "Recruiter",
//     label: "Recruiter",
//   },
//   {
//     value: "Company Career Portal",
//     label: "Company Career Portal",
//   },
//   {
//     value: "LinkedIn",
//     label: "LinkedIn",
//   },
//   {
//     value: "Campus Placement",
//     label: "Campus Placement",
//   },
//   {
//     value: "Hiring Platform",
//     label: "Hiring Platform",
//   },
//   {
//     value: "Walk-in",
//     label: "Walk-in",
//   },
//   {
//     value: "Other",
//     label: "Other",
//   },
// ];

// const EMAIL_REGEX =
//   /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// const MOBILE_REGEX =
//   /^[+0-9()\-\s]{7,25}$/;

// const getMobileDigits = (value = "") =>
//   value.replace(/\D/g, "");

// const validateField = (
//   name,
//   value,
//   currentForm
// ) => {
//   const stringValue =
//     typeof value === "string"
//       ? value.trim()
//       : value;

//   switch (name) {
//     case "title": {
//       if (!stringValue) {
//         return "Interview title is required.";
//       }

//       if (stringValue.length < 10) {
//         return "Title should contain at least 10 characters.";
//       }

//       if (stringValue.length > 250) {
//         return "Title cannot exceed 250 characters.";
//       }

//       return "";
//     }

//     case "company": {
//       if (!stringValue) {
//         return "Company name is required.";
//       }

//       if (stringValue.length < 2) {
//         return "Please enter a valid company name.";
//       }

//       if (stringValue.length > 150) {
//         return "Company name cannot exceed 150 characters.";
//       }

//       return "";
//     }

//     case "role": {
//       if (!stringValue) {
//         return "Role is required.";
//       }

//       if (stringValue.length < 2) {
//         return "Please enter a valid role.";
//       }

//       if (stringValue.length > 150) {
//         return "Role cannot exceed 150 characters.";
//       }

//       return "";
//     }

//     case "name": {
//       if (!stringValue) {
//         return "Your name is required.";
//       }

//       if (stringValue.length < 2) {
//         return "Please enter a valid name.";
//       }

//       if (stringValue.length > 120) {
//         return "Name cannot exceed 120 characters.";
//       }

//       return "";
//     }

//     case "email": {
//       if (!stringValue) {
//         return "Email address is required.";
//       }

//       if (!EMAIL_REGEX.test(stringValue)) {
//         return "Please enter a valid email address.";
//       }

//       return "";
//     }

//     case "mobile": {
//       if (!stringValue) {
//         return "Mobile number is required.";
//       }

//       if (!MOBILE_REGEX.test(stringValue)) {
//         return "Please enter a valid mobile number.";
//       }

//       const digits =
//         getMobileDigits(stringValue);

//       if (
//         digits.length < 7 ||
//         digits.length > 15
//       ) {
//         return "Mobile number should contain 7 to 15 digits.";
//       }

//       return "";
//     }

//     case "publicName": {
//       if (
//         !currentForm.isAnonymous &&
//         stringValue &&
//         stringValue.length > 120
//       ) {
//         return "Public display name cannot exceed 120 characters.";
//       }

//       return "";
//     }

//     case "experienceYears": {
//       if (
//         value === "" ||
//         value === null ||
//         value === undefined
//       ) {
//         return "";
//       }

//       const numberValue = Number(value);

//       if (!Number.isInteger(numberValue)) {
//         return "Experience years must be a whole number.";
//       }

//       if (
//         numberValue < 0 ||
//         numberValue > 50
//       ) {
//         return "Experience years must be between 0 and 50.";
//       }

//       return "";
//     }

//     case "experienceMonths": {
//       if (
//         value === "" ||
//         value === null ||
//         value === undefined
//       ) {
//         return "";
//       }

//       const numberValue = Number(value);

//       if (!Number.isInteger(numberValue)) {
//         return "Experience months must be a whole number.";
//       }

//       if (
//         numberValue < 0 ||
//         numberValue > 11
//       ) {
//         return "Experience months must be between 0 and 11.";
//       }

//       return "";
//     }

//     case "interviewDate": {
//       if (!value) {
//         return "";
//       }

//       const selectedDate =
//         new Date(`${value}T00:00:00`);

//       if (
//         Number.isNaN(
//           selectedDate.getTime()
//         )
//       ) {
//         return "Please enter a valid interview date.";
//       }

//       const today = new Date();

//       today.setHours(
//         23,
//         59,
//         59,
//         999
//       );

//       if (selectedDate > today) {
//         return "Interview date cannot be in the future.";
//       }

//       return "";
//     }

//     case "content": {
//       if (!stringValue) {
//         return "Interview experience is required.";
//       }

//       if (stringValue.length < 100) {
//         return "Please write at least 100 characters.";
//       }

//       if (stringValue.length > 50000) {
//         return "Interview experience cannot exceed 50,000 characters.";
//       }

//       return "";
//     }

//     default:
//       return "";
//   }
// };

// const validateEntireForm = (form) => {
//   const fields = [
//     "title",
//     "company",
//     "role",
//     "name",
//     "email",
//     "mobile",
//     "publicName",
//     "experienceYears",
//     "experienceMonths",
//     "interviewDate",
//     "content",
//   ];

//   const nextErrors = {};

//   fields.forEach((field) => {
//     const error = validateField(
//       field,
//       form[field],
//       form
//     );

//     if (error) {
//       nextErrors[field] = error;
//     }
//   });

//   return nextErrors;
// };

// const InputField = ({
//   label,
//   name,
//   value,
//   onChange,
//   placeholder,
//   type = "text",
//   isRequired = false,
//   icon: Icon,
//   error,
//   inputMode,
// }) => {
//   return (
//     <div className="space-y-2">
//       <label
//         htmlFor={name}
//         className="flex items-center gap-2 text-sm font-semibold text-slate-800"
//       >
//         {Icon && (
//           <Icon className="h-4 w-4 text-blue-600" />
//         )}

//         {label}

//         {isRequired && (
//           <span className="text-red-500">
//             *
//           </span>
//         )}
//       </label>

//       <input
//         id={name}
//         name={name}
//         value={value}
//         onChange={onChange}
//         type={type}
//         inputMode={inputMode}
//         placeholder={placeholder}
//         aria-invalid={
//           error ? "true" : "false"
//         }
//         aria-describedby={
//           error
//             ? `${name}-error`
//             : undefined
//         }
//         className={`
//           w-full rounded-xl border bg-white px-4 py-3
//           text-sm text-slate-900 outline-none transition
//           placeholder:text-slate-400

//           ${
//             error
//               ? "border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
//               : "border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
//           }
//         `}
//       />

//       {error && (
//         <p
//           id={`${name}-error`}
//           className="flex items-start gap-1.5 text-xs font-medium leading-5 text-red-600"
//         >
//           <span className="mt-[2px]">
//             •
//           </span>

//           <span>{error}</span>
//         </p>
//       )}
//     </div>
//   );
// };

// const SelectField = ({
//   label,
//   name,
//   value,
//   onChange,
//   options,
//   icon: Icon,
//   error,
// }) => {
//   return (
//     <div className="space-y-2">
//       <label
//         htmlFor={name}
//         className="flex items-center gap-2 text-sm font-semibold text-slate-800"
//       >
//         {Icon && (
//           <Icon className="h-4 w-4 text-blue-600" />
//         )}

//         {label}
//       </label>

//       <div className="relative">
//         <select
//           id={name}
//           name={name}
//           value={value}
//           onChange={onChange}
//           aria-invalid={
//             error ? "true" : "false"
//           }
//           className={`
//             w-full appearance-none rounded-xl border
//             bg-white px-4 py-3 pr-10 text-sm text-slate-900
//             outline-none transition

//             ${
//               error
//                 ? "border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
//                 : "border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
//             }
//           `}
//         >
//           {options.map((option) => (
//             <option
//               key={option.value}
//               value={option.value}
//             >
//               {option.label}
//             </option>
//           ))}
//         </select>

//         <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
//       </div>

//       {error && (
//         <p className="text-xs font-medium text-red-600">
//           {error}
//         </p>
//       )}
//     </div>
//   );
// };

// const SectionHeader = ({
//   icon: Icon,
//   title,
//   description,
// }) => {
//   return (
//     <div className="mb-6 flex items-start gap-3">
//       <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50">
//         <Icon className="h-5 w-5 text-blue-600" />
//       </div>

//       <div>
//         <h2 className="text-lg font-bold text-slate-900">
//           {title}
//         </h2>

//         {description && (
//           <p className="mt-1 text-sm leading-6 text-slate-500">
//             {description}
//           </p>
//         )}
//       </div>
//     </div>
//   );
// };

// const escapeHtml = (value = "") => {
//   return value
//     .replace(/&/g, "&amp;")
//     .replace(/</g, "&lt;")
//     .replace(/>/g, "&gt;")
//     .replace(/"/g, "&quot;")
//     .replace(/'/g, "&#039;");
// };

// const renderInlineMarkdown = (
//   value = ""
// ) => {
//   let text = escapeHtml(value);

//   const codeParts = [];

//   text = text.replace(
//     /`([^`]+)`/g,
//     (_, code) => {
//       const index =
//         codeParts.length;

//       codeParts.push(
//         `<code class="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[0.9em] font-medium text-pink-700">${code}</code>`
//       );

//       return `@@INLINECODE${index}@@`;
//     }
//   );

//   text = text.replace(
//     /\*\*(.+?)\*\*/g,
//     "<strong>$1</strong>"
//   );

//   text = text.replace(
//     /~~(.+?)~~/g,
//     "<del>$1</del>"
//   );

//   text = text.replace(
//     /(^|[^*])\*([^*\n]+)\*/g,
//     "$1<em>$2</em>"
//   );

//   text = text.replace(
//     /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
//     '<a href="$2" target="_blank" rel="noopener noreferrer" class="font-semibold text-blue-600 underline underline-offset-2 hover:text-blue-700">$1</a>'
//   );

//   codeParts.forEach(
//     (html, index) => {
//       text = text.replace(
//         `@@INLINECODE${index}@@`,
//         html
//       );
//     }
//   );

//   return text;
// };

// const markdownToHtml = (
//   markdown = ""
// ) => {
//   if (!markdown.trim()) {
//     return `
//       <p class="text-slate-400">
//         Your formatted preview will appear here.
//       </p>
//     `;
//   }

//   const lines =
//     markdown.split("\n");

//   const output = [];

//   let inCodeBlock = false;
//   let codeLines = [];

//   let listType = null;
//   let listItems = [];

//   const flushList = () => {
//     if (
//       !listType ||
//       listItems.length === 0
//     ) {
//       listType = null;
//       listItems = [];
//       return;
//     }

//     const tag =
//       listType === "ol"
//         ? "ol"
//         : "ul";

//     const classes =
//       listType === "ol"
//         ? "list-decimal"
//         : "list-disc";

//     output.push(`
//       <${tag} class="${classes} space-y-2 pl-6 text-slate-700">
//         ${listItems
//           .map(
//             (item) =>
//               `<li>${renderInlineMarkdown(
//                 item
//               )}</li>`
//           )
//           .join("")}
//       </${tag}>
//     `);

//     listType = null;
//     listItems = [];
//   };

//   const flushCode = () => {
//     if (!codeLines.length) {
//       return;
//     }

//     output.push(`
//       <pre class="my-4 overflow-x-auto rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm leading-6 text-slate-100">
//         <code>${escapeHtml(
//           codeLines.join("\n")
//         )}</code>
//       </pre>
//     `);

//     codeLines = [];
//   };

//   lines.forEach((line) => {
//     if (
//       line.trim().startsWith(
//         "```"
//       )
//     ) {
//       flushList();

//       if (inCodeBlock) {
//         flushCode();
//         inCodeBlock = false;
//       } else {
//         inCodeBlock = true;
//       }

//       return;
//     }

//     if (inCodeBlock) {
//       codeLines.push(line);
//       return;
//     }

//     if (
//       /^(\s*)(---|\*\*\*|___)\s*$/.test(
//         line
//       )
//     ) {
//       flushList();

//       output.push(
//         '<hr class="my-6 border-0 border-t border-slate-200" />'
//       );

//       return;
//     }

//     const h1 =
//       line.match(/^# (.+)$/);

//     if (h1) {
//       flushList();

//       output.push(`
//         <h1 class="mt-6 mb-3 text-2xl font-black tracking-tight text-slate-950">
//           ${renderInlineMarkdown(
//             h1[1]
//           )}
//         </h1>
//       `);

//       return;
//     }

//     const h2 =
//       line.match(/^## (.+)$/);

//     if (h2) {
//       flushList();

//       output.push(`
//         <h2 class="mt-6 mb-3 text-xl font-bold text-slate-900">
//           ${renderInlineMarkdown(
//             h2[1]
//           )}
//         </h2>
//       `);

//       return;
//     }

//     const h3 =
//       line.match(/^### (.+)$/);

//     if (h3) {
//       flushList();

//       output.push(`
//         <h3 class="mt-5 mb-2 text-lg font-bold text-slate-900">
//           ${renderInlineMarkdown(
//             h3[1]
//           )}
//         </h3>
//       `);

//       return;
//     }

//     const quote =
//       line.match(/^>\s?(.*)$/);

//     if (quote) {
//       flushList();

//       output.push(`
//         <blockquote class="my-4 border-l-4 border-blue-500 bg-blue-50 px-4 py-3 text-slate-700">
//           ${renderInlineMarkdown(
//             quote[1]
//           )}
//         </blockquote>
//       `);

//       return;
//     }

//     const bullet =
//       line.match(
//         /^\s*[-*]\s+(.+)$/
//       );

//     if (bullet) {
//       if (
//         listType &&
//         listType !== "ul"
//       ) {
//         flushList();
//       }

//       listType = "ul";

//       listItems.push(
//         bullet[1]
//       );

//       return;
//     }

//     const numbered =
//       line.match(
//         /^\s*\d+\.\s+(.+)$/
//       );

//     if (numbered) {
//       if (
//         listType &&
//         listType !== "ol"
//       ) {
//         flushList();
//       }

//       listType = "ol";

//       listItems.push(
//         numbered[1]
//       );

//       return;
//     }

//     flushList();

//     if (!line.trim()) {
//       output.push(
//         '<div class="h-3"></div>'
//       );
//       return;
//     }

//     output.push(`
//       <p class="leading-7 text-slate-700">
//         ${renderInlineMarkdown(
//           line
//         )}
//       </p>
//     `);
//   });

//   flushList();

//   if (inCodeBlock) {
//     flushCode();
//   }

//   return output.join("");
// };

// const ToolbarButton = ({
//   icon: Icon,
//   label,
//   onClick,
// }) => {
//   return (
//     <button
//       type="button"
//       onClick={onClick}
//       title={label}
//       aria-label={label}
//       className="
//         inline-flex h-9 w-9 items-center justify-center
//         rounded-lg text-slate-600 transition
//         hover:bg-slate-200 hover:text-slate-950
//         active:scale-95
//       "
//     >
//       <Icon className="h-4 w-4" />
//     </button>
//   );
// };

// const MarkdownEditor = ({
//   value,
//   onChange,
//   error,
// }) => {
//   const textareaRef =
//     useRef(null);

//   const [mode, setMode] =
//     useState("write");

//   const restoreSelection = (
//     start,
//     end
//   ) => {
//     requestAnimationFrame(() => {
//       const textarea =
//         textareaRef.current;

//       if (!textarea) {
//         return;
//       }

//       textarea.focus();

//       textarea.setSelectionRange(
//         start,
//         end
//       );
//     });
//   };

//   const applyInline = (
//     before,
//     after = before,
//     placeholder = "text"
//   ) => {
//     const textarea =
//       textareaRef.current;

//     if (!textarea) {
//       return;
//     }

//     const start =
//       textarea.selectionStart;

//     const end =
//       textarea.selectionEnd;

//     const selected =
//       value.slice(start, end) ||
//       placeholder;

//     const nextValue =
//       value.slice(0, start) +
//       before +
//       selected +
//       after +
//       value.slice(end);

//     onChange(nextValue);

//     const contentStart =
//       start + before.length;

//     restoreSelection(
//       contentStart,
//       contentStart +
//         selected.length
//     );
//   };

//   const applyLinePrefix = (
//     prefix,
//     placeholder
//   ) => {
//     const textarea =
//       textareaRef.current;

//     if (!textarea) {
//       return;
//     }

//     const start =
//       textarea.selectionStart;

//     const end =
//       textarea.selectionEnd;

//     const lineStart =
//       value.lastIndexOf(
//         "\n",
//         Math.max(0, start - 1)
//       ) + 1;

//     let selected =
//       value.slice(
//         lineStart,
//         end
//       );

//     if (!selected) {
//       selected = placeholder;
//     }

//     const formatted =
//       selected
//         .split("\n")
//         .map((line) => {
//           if (!line.trim()) {
//             return line;
//           }

//           return `${prefix}${line}`;
//         })
//         .join("\n");

//     const nextValue =
//       value.slice(0, lineStart) +
//       formatted +
//       value.slice(end);

//     onChange(nextValue);

//     restoreSelection(
//       lineStart,
//       lineStart +
//         formatted.length
//     );
//   };

//   const applyNumberedList = () => {
//     const textarea =
//       textareaRef.current;

//     if (!textarea) {
//       return;
//     }

//     const start =
//       textarea.selectionStart;

//     const end =
//       textarea.selectionEnd;

//     const lineStart =
//       value.lastIndexOf(
//         "\n",
//         Math.max(0, start - 1)
//       ) + 1;

//     let selected =
//       value.slice(
//         lineStart,
//         end
//       );

//     if (!selected) {
//       selected = "List item";
//     }

//     const formatted =
//       selected
//         .split("\n")
//         .map((line, index) =>
//           line.trim()
//             ? `${index + 1}. ${line}`
//             : line
//         )
//         .join("\n");

//     const nextValue =
//       value.slice(0, lineStart) +
//       formatted +
//       value.slice(end);

//     onChange(nextValue);

//     restoreSelection(
//       lineStart,
//       lineStart +
//         formatted.length
//     );
//   };

//   const insertAtCursor = (
//     insertText,
//     selectionOffset = null
//   ) => {
//     const textarea =
//       textareaRef.current;

//     if (!textarea) {
//       return;
//     }

//     const start =
//       textarea.selectionStart;

//     const end =
//       textarea.selectionEnd;

//     const nextValue =
//       value.slice(0, start) +
//       insertText +
//       value.slice(end);

//     onChange(nextValue);

//     const cursor =
//       start +
//       (selectionOffset ??
//         insertText.length);

//     restoreSelection(
//       cursor,
//       cursor
//     );
//   };

//   const insertCodeBlock = () => {
//     const textarea =
//       textareaRef.current;

//     if (!textarea) {
//       return;
//     }

//     const start =
//       textarea.selectionStart;

//     const end =
//       textarea.selectionEnd;

//     const selected =
//       value.slice(start, end) ||
//       "your code here";

//     const before =
//       "\n\n```\n";

//     const after =
//       "\n```\n\n";

//     const nextValue =
//       value.slice(0, start) +
//       before +
//       selected +
//       after +
//       value.slice(end);

//     onChange(nextValue);

//     restoreSelection(
//       start + before.length,
//       start +
//         before.length +
//         selected.length
//     );
//   };

//   const insertLink = () => {
//     const textarea =
//       textareaRef.current;

//     if (!textarea) {
//       return;
//     }

//     const start =
//       textarea.selectionStart;

//     const end =
//       textarea.selectionEnd;

//     const selected =
//       value.slice(start, end) ||
//       "link text";

//     const prefix = "[";
//     const middle = "](";
//     const url =
//       "https://example.com";
//     const suffix = ")";

//     const insertText =
//       `${prefix}${selected}${middle}${url}${suffix}`;

//     const nextValue =
//       value.slice(0, start) +
//       insertText +
//       value.slice(end);

//     onChange(nextValue);

//     const urlStart =
//       start +
//       prefix.length +
//       selected.length +
//       middle.length;

//     restoreSelection(
//       urlStart,
//       urlStart + url.length
//     );
//   };

//   const characterCount =
//     value.length;

//   return (
//     <div className="space-y-2">
//       <label
//         htmlFor="content"
//         className="flex items-center gap-2 text-sm font-semibold text-slate-800"
//       >
//         Interview Experience

//         <span className="text-red-500">
//           *
//         </span>
//       </label>

//       <div
//         className={`
//           overflow-hidden rounded-2xl border bg-white transition

//           ${
//             error
//               ? "border-red-400 ring-4 ring-red-500/5"
//               : "border-slate-200 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10"
//           }
//         `}
//       >
//         {/* WRITE / PREVIEW */}

//         <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-3 py-2">
//           <div className="flex rounded-lg bg-slate-200/70 p-1">
//             <button
//               type="button"
//               onClick={() =>
//                 setMode("write")
//               }
//               className={`
//                 flex items-center gap-2 rounded-md px-3 py-1.5
//                 text-xs font-semibold transition

//                 ${
//                   mode === "write"
//                     ? "bg-white text-slate-900 shadow-sm"
//                     : "text-slate-500 hover:text-slate-900"
//                 }
//               `}
//             >
//               <Pencil className="h-3.5 w-3.5" />
//               Write
//             </button>

//             <button
//               type="button"
//               onClick={() =>
//                 setMode("preview")
//               }
//               className={`
//                 flex items-center gap-2 rounded-md px-3 py-1.5
//                 text-xs font-semibold transition

//                 ${
//                   mode === "preview"
//                     ? "bg-white text-slate-900 shadow-sm"
//                     : "text-slate-500 hover:text-slate-900"
//                 }
//               `}
//             >
//               <Eye className="h-3.5 w-3.5" />
//               Preview
//             </button>
//           </div>

//           <span className="hidden text-xs text-slate-400 sm:block">
//             Markdown formatting supported
//           </span>
//         </div>

//         {mode === "write" && (
//           <>
//             {/* TOOLBAR */}

//             <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-white px-3 py-2">
//               <ToolbarButton
//                 icon={Heading1}
//                 label="Heading 1"
//                 onClick={() =>
//                   applyLinePrefix(
//                     "# ",
//                     "Main heading"
//                   )
//                 }
//               />

//               <ToolbarButton
//                 icon={Heading2}
//                 label="Heading 2"
//                 onClick={() =>
//                   applyLinePrefix(
//                     "## ",
//                     "Section heading"
//                   )
//                 }
//               />

//               <span className="mx-1 h-5 w-px bg-slate-200" />

//               <ToolbarButton
//                 icon={Bold}
//                 label="Bold"
//                 onClick={() =>
//                   applyInline(
//                     "**",
//                     "**",
//                     "bold text"
//                   )
//                 }
//               />

//               <ToolbarButton
//                 icon={Italic}
//                 label="Italic"
//                 onClick={() =>
//                   applyInline(
//                     "*",
//                     "*",
//                     "italic text"
//                   )
//                 }
//               />

//               <ToolbarButton
//                 icon={
//                   Strikethrough
//                 }
//                 label="Strikethrough"
//                 onClick={() =>
//                   applyInline(
//                     "~~",
//                     "~~",
//                     "strikethrough"
//                   )
//                 }
//               />

//               <span className="mx-1 h-5 w-px bg-slate-200" />

//               <ToolbarButton
//                 icon={List}
//                 label="Bullet list"
//                 onClick={() =>
//                   applyLinePrefix(
//                     "- ",
//                     "List item"
//                   )
//                 }
//               />

//               <ToolbarButton
//                 icon={ListOrdered}
//                 label="Numbered list"
//                 onClick={
//                   applyNumberedList
//                 }
//               />

//               <ToolbarButton
//                 icon={Quote}
//                 label="Quote"
//                 onClick={() =>
//                   applyLinePrefix(
//                     "> ",
//                     "Important note"
//                   )
//                 }
//               />

//               <span className="mx-1 h-5 w-px bg-slate-200" />

//               <ToolbarButton
//                 icon={Code2}
//                 label="Inline code"
//                 onClick={() =>
//                   applyInline(
//                     "`",
//                     "`",
//                     "code"
//                   )
//                 }
//               />

//               <button
//                 type="button"
//                 onClick={
//                   insertCodeBlock
//                 }
//                 title="Code block"
//                 className="
//                   flex h-9 items-center justify-center gap-1.5
//                   rounded-lg px-2.5 text-xs font-bold text-slate-600
//                   transition hover:bg-slate-200 hover:text-slate-950
//                 "
//               >
//                 <Code2 className="h-4 w-4" />
//                 Code
//               </button>

//               <ToolbarButton
//                 icon={Link2}
//                 label="Insert link"
//                 onClick={
//                   insertLink
//                 }
//               />

//               <span className="mx-1 h-5 w-px bg-slate-200" />

//               <ToolbarButton
//                 icon={Minus}
//                 label="Horizontal line"
//                 onClick={() =>
//                   insertAtCursor(
//                     "\n\n---\n\n"
//                   )
//                 }
//               />

//               <ToolbarButton
//                 icon={Pilcrow}
//                 label="Add paragraph spacing"
//                 onClick={() =>
//                   insertAtCursor(
//                     "\n\n"
//                   )
//                 }
//               />
//             </div>

//             <textarea
//               ref={textareaRef}
//               id="content"
//               name="content"
//               value={value}
//               onChange={(event) =>
//                 onChange(
//                   event.target.value
//                 )
//               }
//               rows={20}
//               spellCheck
//               placeholder={`Example:

// # Mastercard AI Engineer Interview Experience

// I recently interviewed for an **AI Engineer** role.

// ---

// ## Round 1 - Online Assessment

// There were two DSA questions:

// 1. Arrays / Hashing problem
// 2. Graph problem

// **Duration:** 60 minutes  
// **Difficulty:** Medium

// ---

// ## Round 2 - GenAI

// The interviewer focused on:

// - RAG architecture
// - MCP
// - Vector databases
// - Google ADK

// > The discussion on RAG and MCP lasted around 30 minutes.

// ## Preparation

// I mainly focused on:

// - DSA
// - System Design
// - RAG
// - MCP

// ## Advice

// Be comfortable explaining your projects in depth and discussing trade-offs.`}
//               className="
//                 min-h-[430px] w-full resize-y border-0
//                 bg-white px-4 py-5 font-mono text-sm
//                 leading-7 text-slate-900 outline-none
//                 placeholder:font-sans placeholder:text-slate-400
//               "
//             />
//           </>
//         )}

//         {mode === "preview" && (
//           <div className="min-h-[430px] bg-white px-5 py-6 sm:px-7">
//             <div
//               className="space-y-3"
//               dangerouslySetInnerHTML={{
//                 __html:
//                   markdownToHtml(
//                     value
//                   ),
//               }}
//             />
//           </div>
//         )}

//         <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 bg-slate-50 px-4 py-2.5">
//           <p className="text-xs text-slate-500">
//             Minimum 100 characters.
//           </p>

//           <p
//             className={`text-xs font-semibold ${
//               characterCount >= 100
//                 ? "text-green-600"
//                 : error
//                   ? "text-red-600"
//                   : "text-slate-500"
//             }`}
//           >
//             {characterCount.toLocaleString()}
//             {" / "}
//             50,000 characters
//           </p>
//         </div>
//       </div>

//       {error && (
//         <p className="flex items-start gap-1.5 text-xs font-medium leading-5 text-red-600">
//           <span>•</span>
//           <span>{error}</span>
//         </p>
//       )}
//     </div>
//   );
// };

// const AddInterviewExperience = () => {
//   const [form, setForm] =
//     useState(initialForm);

//   const [errors, setErrors] =
//     useState({});

//   const [
//     submitting,
//     setSubmitting,
//   ] = useState(false);

//   const [
//     submitted,
//     setSubmitted,
//   ] = useState(false);

//   const ENDPOINT = useMemo(() => {
//     const cleanBase =
//       BASE_URL.endsWith("/")
//         ? BASE_URL.slice(0, -1)
//         : BASE_URL;

//     return `${cleanBase}/api/interview`;
//   }, []);

//   const updateField = (
//     name,
//     value
//   ) => {
//     const nextForm = {
//       ...form,
//       [name]: value,
//     };

//     setForm(nextForm);

//     if (submitted) {
//       setSubmitted(false);
//     }

//     /*
//     |--------------------------------------------------------------------------
//     | LIVE ERROR REMOVAL
//     |--------------------------------------------------------------------------
//     |
//     | Only revalidate a field if it currently has an error.
//     | As soon as the value becomes valid, the red state disappears.
//     |
//     */

//     if (errors[name]) {
//       const nextError =
//         validateField(
//           name,
//           value,
//           nextForm
//         );

//       setErrors((previous) => {
//         const next = {
//           ...previous,
//         };

//         if (nextError) {
//           next[name] =
//             nextError;
//         } else {
//           delete next[name];
//         }

//         return next;
//       });
//     }

//     if (errors.submit) {
//       setErrors((previous) => {
//         const next = {
//           ...previous,
//         };

//         delete next.submit;

//         return next;
//       });
//     }
//   };

//   const handleChange = (
//     event
//   ) => {
//     const {
//       name,
//       value,
//       type,
//       checked,
//     } = event.target;

//     updateField(
//       name,
//       type === "checkbox"
//         ? checked
//         : value
//     );

//     if (
//       name === "isAnonymous" &&
//       checked
//     ) {
//       setErrors((previous) => {
//         const next = {
//           ...previous,
//         };

//         delete next.publicName;

//         return next;
//       });
//     }
//   };

//   const handleContentChange = (
//     value
//   ) => {
//     updateField(
//       "content",
//       value
//     );
//   };

//   const scrollToFirstError = (
//     validationErrors
//   ) => {
//     const firstField =
//       Object.keys(
//         validationErrors
//       )[0];

//     if (!firstField) {
//       return;
//     }

//     window.setTimeout(() => {
//       const element =
//         document.getElementById(
//           firstField
//         );

//       element?.scrollIntoView({
//         behavior: "smooth",
//         block: "center",
//       });

//       element?.focus?.();
//     }, 50);
//   };

//   const handleSubmit = async (
//     event
//   ) => {
//     event.preventDefault();

//     if (submitting) {
//       return;
//     }

//     const validationErrors =
//       validateEntireForm(form);

//     if (
//       Object.keys(
//         validationErrors
//       ).length > 0
//     ) {
//       setErrors(
//         validationErrors
//       );

//       scrollToFirstError(
//         validationErrors
//       );

//       toast.error(
//         "Please fix the highlighted fields."
//       );

//       return;
//     }

//     setErrors({});
//     setSubmitting(true);

//     try {
//       const payload = {
//         title:
//           form.title.trim(),

//         company:
//           form.company.trim(),

//         role:
//           form.role.trim(),

//         name:
//           form.name.trim(),

//         email:
//           form.email
//             .trim()
//             .toLowerCase(),

//         mobile:
//           form.mobile.trim(),

//         isAnonymous:
//           form.isAnonymous,

//         publicName:
//           form.isAnonymous
//             ? ""
//             : form.publicName.trim() ||
//               form.name.trim(),

//         experienceYears:
//           form.experienceYears ===
//           ""
//             ? null
//             : Number(
//                 form.experienceYears
//               ),

//         experienceMonths:
//           form.experienceMonths ===
//           ""
//             ? null
//             : Number(
//                 form.experienceMonths
//               ),

//         location:
//           form.location.trim(),

//         country:
//           form.country.trim(),

//         interviewDate:
//           form.interviewDate ||
//           null,

//         applicationSource:
//           form.applicationSource.trim(),

//         interviewMode:
//           form.interviewMode,

//         difficulty:
//           form.difficulty,

//         result:
//           form.result,

//         content:
//           form.content.trim(),
//       };

//       const response =
//         await fetch(
//           ENDPOINT,
//           {
//             method: "POST",

//             headers: {
//               "Content-Type":
//                 "application/json",
//             },

//             body:
//               JSON.stringify(
//                 payload
//               ),
//           }
//         );

//       let data = {};

//       try {
//         data =
//           await response.json();
//       } catch {
//         data = {};
//       }

//       if (!response.ok) {
//         let message =
//           data?.message ||
//           "Unable to submit interview experience.";

//         if (
//           response.status === 429
//         ) {
//           const minutes =
//             data?.retryAfterMinutes;

//           message = minutes
//             ? `You have reached the submission limit. Please try again in approximately ${minutes} minutes.`
//             : "You can submit a maximum of 3 interview experiences within 6 hours.";
//         }

//         if (
//           data?.code ===
//           "DUPLICATE_SUBMISSION"
//         ) {
//           message =
//             "A similar interview experience was submitted recently.";
//         }

//         if (
//           data?.code ===
//           "DUPLICATE_CONTENT"
//         ) {
//           message =
//             "This interview experience appears to have already been submitted.";
//         }

//         setErrors((previous) => ({
//           ...previous,
//           submit: message,
//         }));

//         toast.error(message, {
//           duration: 6000,
//         });

//         return;
//       }

//       toast.success(
//         "Interview experience submitted successfully!",
//         {
//           duration: 5000,
//         }
//       );

//       setSubmitted(true);
//       setErrors({});
//       setForm(initialForm);

//       window.scrollTo({
//         top: 0,
//         behavior: "smooth",
//       });
//     } catch (error) {
//       console.error(
//         "Interview submission error:",
//         error
//       );

//       const message =
//         "Something went wrong while submitting. Please try again.";

//       setErrors((previous) => ({
//         ...previous,
//         submit: message,
//       }));

//       toast.error(message);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <>
//       <Helmet>
//         <title>
//           Share Your Interview
//           Experience | TargetTrek
//         </title>

//         <meta
//           name="description"
//           content="Share your software engineering interview experience with the TargetTrek engineering community."
//         />

//         <meta
//           name="robots"
//           content="index,follow"
//         />
//       </Helmet>

//       <div className="min-h-screen bg-slate-50 mt-12">
//         {/* HERO */}

//         <section className="border-b border-slate-200 bg-white">
//           <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
//             <div className="mx-auto max-w-3xl text-center">
//               <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-600/20">
//                 <BriefcaseBusiness className="h-7 w-7 text-white" />
//               </div>

//               <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-blue-600">
//                 TargetTrek Interviews
//               </p>

//               <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
//                 Share Your Interview
//                 Experience
//               </h1>

//               <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
//                 Help other engineers
//                 prepare better by sharing
//                 the rounds, questions and
//                 experience from your
//                 interview.
//               </p>

//               <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm text-slate-600">
//                 <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2">
//                   <ShieldCheck className="h-4 w-4 text-green-600" />

//                   Reviewed before
//                   publishing
//                 </div>

//                 <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2">
//                   <CircleUserRound className="h-4 w-4 text-blue-600" />

//                   Anonymous publishing
//                   available
//                 </div>
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* SUCCESS */}

//         {submitted && (
//           <div className="mx-auto max-w-4xl px-4 pt-8 sm:px-6">
//             <div className="flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-5">
//               <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-green-600" />

//               <div>
//                 <h2 className="font-bold text-green-900">
//                   Submission received
//                 </h2>

//                 <p className="mt-1 text-sm leading-6 text-green-800">
//                   Your interview
//                   experience has been
//                   submitted for review.
//                   It will only become
//                   public after approval.
//                 </p>
//               </div>
//             </div>
//           </div>
//         )}

//         <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:py-12">
//           <form
//             noValidate
//             onSubmit={handleSubmit}
//             className="space-y-6"
//           >
//             {/* INTERVIEW DETAILS */}

//             <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
//               <SectionHeader
//                 icon={
//                   BriefcaseBusiness
//                 }
//                 title="Interview Details"
//                 description="Tell us which interview experience you are sharing."
//               />

//               <div className="space-y-5">
//                 <InputField
//                   label="Interview Title"
//                   name="title"
//                   value={form.title}
//                   onChange={
//                     handleChange
//                   }
//                   placeholder="e.g. Mastercard AI Engineer Interview Experience"
//                   isRequired
//                   icon={FileText}
//                   error={
//                     errors.title
//                   }
//                 />

//                 <div className="grid gap-5 md:grid-cols-2">
//                   <InputField
//                     label="Company"
//                     name="company"
//                     value={
//                       form.company
//                     }
//                     onChange={
//                       handleChange
//                     }
//                     placeholder="e.g. Amazon"
//                     isRequired
//                     icon={
//                       Building2
//                     }
//                     error={
//                       errors.company
//                     }
//                   />

//                   <InputField
//                     label="Role"
//                     name="role"
//                     value={form.role}
//                     onChange={
//                       handleChange
//                     }
//                     placeholder="e.g. SDE-2"
//                     isRequired
//                     icon={
//                       BriefcaseBusiness
//                     }
//                     error={
//                       errors.role
//                     }
//                   />
//                 </div>
//               </div>
//             </section>

//             {/* USER */}

//             <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
//               <SectionHeader
//                 icon={UserRound}
//                 title="Your Information"
//                 description="Your email and mobile number are private and are not displayed publicly."
//               />

//               <div className="grid gap-5 md:grid-cols-2">
//                 <InputField
//                   label="Your Name"
//                   name="name"
//                   value={form.name}
//                   onChange={
//                     handleChange
//                   }
//                   placeholder="Enter your name"
//                   isRequired
//                   icon={UserRound}
//                   error={
//                     errors.name
//                   }
//                 />

//                 <InputField
//                   label="Email"
//                   name="email"
//                   value={form.email}
//                   onChange={
//                     handleChange
//                   }
//                   placeholder="you@example.com"
//                   type="text"
//                   inputMode="email"
//                   isRequired
//                   icon={Mail}
//                   error={
//                     errors.email
//                   }
//                 />

//                 <InputField
//                   label="Mobile Number"
//                   name="mobile"
//                   value={form.mobile}
//                   onChange={
//                     handleChange
//                   }
//                   placeholder="+91 98XXXXXXXX"
//                   type="text"
//                   inputMode="tel"
//                   isRequired
//                   icon={Phone}
//                   error={
//                     errors.mobile
//                   }
//                 />
//               </div>

//               <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50/70 p-4">
//                 <label className="flex cursor-pointer items-start gap-3">
//                   <input
//                     type="checkbox"
//                     name="isAnonymous"
//                     checked={
//                       form.isAnonymous
//                     }
//                     onChange={
//                       handleChange
//                     }
//                     className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
//                   />

//                   <div>
//                     <p className="text-sm font-semibold text-slate-900">
//                       Publish anonymously
//                     </p>

//                     <p className="mt-1 text-xs leading-5 text-slate-600">
//                       Your name, email
//                       and mobile number
//                       will not appear on
//                       the public
//                       interview page.
//                     </p>
//                   </div>
//                 </label>

//                 {!form.isAnonymous && (
//                   <div className="mt-4">
//                     <InputField
//                       label="Public Display Name"
//                       name="publicName"
//                       value={
//                         form.publicName
//                       }
//                       onChange={
//                         handleChange
//                       }
//                       placeholder="Leave blank to use your name"
//                       icon={
//                         CircleUserRound
//                       }
//                       error={
//                         errors.publicName
//                       }
//                     />
//                   </div>
//                 )}
//               </div>
//             </section>

//             {/* OPTIONAL */}

//             <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
//               <SectionHeader
//                 icon={Sparkles}
//                 title="Additional Details"
//                 description="Optional details that can help other engineers understand the interview context."
//               />

//               <div className="grid gap-5 sm:grid-cols-2">
//                 <InputField
//                   label="Experience - Years"
//                   name="experienceYears"
//                   value={
//                     form.experienceYears
//                   }
//                   onChange={
//                     handleChange
//                   }
//                   placeholder="2"
//                   type="text"
//                   inputMode="numeric"
//                   icon={Clock3}
//                   error={
//                     errors.experienceYears
//                   }
//                 />

//                 <InputField
//                   label="Experience - Months"
//                   name="experienceMonths"
//                   value={
//                     form.experienceMonths
//                   }
//                   onChange={
//                     handleChange
//                   }
//                   placeholder="6"
//                   type="text"
//                   inputMode="numeric"
//                   icon={Clock3}
//                   error={
//                     errors.experienceMonths
//                   }
//                 />

//                 <InputField
//                   label="Location"
//                   name="location"
//                   value={
//                     form.location
//                   }
//                   onChange={
//                     handleChange
//                   }
//                   placeholder="e.g. Bengaluru"
//                   icon={MapPin}
//                 />

//                 <InputField
//                   label="Country"
//                   name="country"
//                   value={
//                     form.country
//                   }
//                   onChange={
//                     handleChange
//                   }
//                   placeholder="e.g. India"
//                   icon={Globe2}
//                 />

//                 <InputField
//                   label="Interview Date"
//                   name="interviewDate"
//                   value={
//                     form.interviewDate
//                   }
//                   onChange={
//                     handleChange
//                   }
//                   type="date"
//                   icon={
//                     CalendarDays
//                   }
//                   error={
//                     errors.interviewDate
//                   }
//                 />

//                 <SelectField
//                   label="Application Source"
//                   name="applicationSource"
//                   value={
//                     form.applicationSource
//                   }
//                   onChange={
//                     handleChange
//                   }
//                   options={
//                     applicationSourceOptions
//                   }
//                   icon={Send}
//                 />

//                 <SelectField
//                   label="Interview Mode"
//                   name="interviewMode"
//                   value={
//                     form.interviewMode
//                   }
//                   onChange={
//                     handleChange
//                   }
//                   options={
//                     interviewModes
//                   }
//                   icon={
//                     BriefcaseBusiness
//                   }
//                 />

//                 <SelectField
//                   label="Overall Difficulty"
//                   name="difficulty"
//                   value={
//                     form.difficulty
//                   }
//                   onChange={
//                     handleChange
//                   }
//                   options={
//                     difficultyOptions
//                   }
//                   icon={Sparkles}
//                 />

//                 <SelectField
//                   label="Interview Result"
//                   name="result"
//                   value={
//                     form.result
//                   }
//                   onChange={
//                     handleChange
//                   }
//                   options={
//                     resultOptions
//                   }
//                   icon={
//                     CheckCircle2
//                   }
//                 />
//               </div>
//             </section>

//             {/* EXPERIENCE */}

//             <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
//               <SectionHeader
//                 icon={FileText}
//                 title="Your Interview Experience"
//                 description="Use the formatting toolbar to structure your rounds, questions, preparation and advice."
//               />

//               <div className="mb-5 rounded-xl border border-blue-100 bg-blue-50/60 p-4">
//                 <p className="text-sm font-bold text-slate-900">
//                   A useful interview
//                   experience normally
//                   includes:
//                 </p>

//                 <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
//                   <span>
//                     • Interview rounds
//                   </span>

//                   <span>
//                     • Questions asked
//                   </span>

//                   <span>
//                     • DSA / LLD / HLD
//                     topics
//                   </span>

//                   <span>
//                     • Backend / GenAI
//                     topics
//                   </span>

//                   <span>
//                     • Follow-up
//                     questions
//                   </span>

//                   <span>
//                     • Difficulty
//                   </span>

//                   <span>
//                     • Preparation
//                     strategy
//                   </span>

//                   <span>
//                     • Advice for other
//                     engineers
//                   </span>
//                 </div>
//               </div>

//               <MarkdownEditor
//                 value={form.content}
//                 onChange={
//                   handleContentChange
//                 }
//                 error={
//                   errors.content
//                 }
//               />
//             </section>

//             {/* PRIVACY */}

//             <section className="rounded-2xl border border-slate-200 bg-slate-100/70 p-5">
//               <div className="flex items-start gap-3">
//                 <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />

//                 <div className="space-y-2">
//                   <h3 className="text-sm font-bold text-slate-900">
//                     Before you submit
//                   </h3>

//                   <p className="text-sm leading-6 text-slate-600">
//                     Every submission is
//                     reviewed before it
//                     becomes public.
//                     TargetTrek may improve
//                     formatting and grammar,
//                     and may remove spam,
//                     promotional links,
//                     personal information or
//                     confidential information
//                     before publishing.
//                   </p>

//                   <p className="text-sm leading-6 text-slate-600">
//                     Your email and mobile
//                     number are used only for
//                     moderation or
//                     communication related to
//                     your submission and are
//                     never displayed publicly.
//                   </p>
//                 </div>
//               </div>
//             </section>

//             {/* SERVER ERROR */}

//             {errors.submit && (
//               <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
//                 <p className="text-sm font-semibold text-red-700">
//                   {errors.submit}
//                 </p>
//               </div>
//             )}

//             {/* SUBMIT */}

//             <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//               <p className="max-w-md text-xs leading-5 text-slate-500">
//                 Maximum 3 interview
//                 submissions are allowed
//                 within a rolling 6-hour
//                 period.
//               </p>

//               <button
//                 type="submit"
//                 disabled={submitting}
//                 className="
//                   inline-flex min-h-[48px] items-center justify-center
//                   gap-2 rounded-xl bg-blue-600 px-7 py-3
//                   text-sm font-bold text-white shadow-lg
//                   shadow-blue-600/20 transition
//                   hover:bg-blue-700
//                   disabled:cursor-not-allowed
//                   disabled:opacity-60
//                 "
//               >
//                 {submitting ? (
//                   <>
//                     <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

//                     Submitting...
//                   </>
//                 ) : (
//                   <>
//                     <Send className="h-4 w-4" />

//                     Submit Interview
//                     Experience
//                   </>
//                 )}
//               </button>
//             </div>
//           </form>
//         </main>
//       </div>
//     </>
//   );
// };

// export default AddInterviewExperience;

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";

import {
  ArrowLeft,
  Bold,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleUserRound,
  Clock3,
  Code2,
  Eye,
  FileText,
  Globe2,
  Heading1,
  Heading2,
  Italic,
  Link2,
  List,
  ListOrdered,
  Mail,
  MapPin,
  Minus,
  Pencil,
  Phone,
  Pilcrow,
  Quote,
  Send,
  ShieldCheck,
  Sparkles,
  Strikethrough,
  UserRound,
} from "lucide-react";

import BASE_URL from "../utils/Url.js";

const SITE_URL = "https://www.targettrek.in";
const CANONICAL_URL = `${SITE_URL}/interview/create`;

const initialForm = {
  title: "",
  company: "",
  role: "",
  name: "",
  email: "",
  mobile: "",
  isAnonymous: true,
  publicName: "",
  experienceYears: "",
  experienceMonths: "",
  location: "",
  country: "India",
  interviewDate: "",
  applicationSource: "",
  interviewMode: "NOT_SPECIFIED",
  difficulty: "NOT_SPECIFIED",
  result: "NOT_DISCLOSED",
  content: "",
};

const interviewModes = [
  {
    value: "NOT_SPECIFIED",
    label: "Not specified",
  },
  {
    value: "ONLINE",
    label: "Online",
  },
  {
    value: "OFFLINE",
    label: "Offline",
  },
  {
    value: "HYBRID",
    label: "Hybrid",
  },
];

const difficultyOptions = [
  {
    value: "NOT_SPECIFIED",
    label: "Not specified",
  },
  {
    value: "EASY",
    label: "Easy",
  },
  {
    value: "MEDIUM",
    label: "Medium",
  },
  {
    value: "MEDIUM_HARD",
    label: "Medium-Hard",
  },
  {
    value: "HARD",
    label: "Hard",
  },
];

const resultOptions = [
  {
    value: "NOT_DISCLOSED",
    label: "Prefer not to say",
  },
  {
    value: "SELECTED",
    label: "Selected",
  },
  {
    value: "REJECTED",
    label: "Rejected",
  },
  {
    value: "WAITING",
    label: "Waiting for result",
  },
  {
    value: "OFFER_DECLINED",
    label: "Offer declined",
  },
];

const applicationSourceOptions = [
  {
    value: "",
    label: "Select source",
  },
  {
    value: "Referral",
    label: "Referral",
  },
  {
    value: "Recruiter",
    label: "Recruiter",
  },
  {
    value: "Company Career Portal",
    label: "Company Career Portal",
  },
  {
    value: "LinkedIn",
    label: "LinkedIn",
  },
  {
    value: "Campus Placement",
    label: "Campus Placement",
  },
  {
    value: "Hiring Platform",
    label: "Hiring Platform",
  },
  {
    value: "Walk-in",
    label: "Walk-in",
  },
  {
    value: "Other",
    label: "Other",
  },
];

const EMAIL_REGEX =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MOBILE_REGEX =
  /^[+0-9()\-\s]{7,25}$/;

const getMobileDigits = (
  value = ""
) => value.replace(/\D/g, "");

const getStoredTheme = () => {
  if (
    typeof window === "undefined"
  ) {
    return "light";
  }

  try {
    return localStorage.getItem(
      "theme"
    ) === "dark"
      ? "dark"
      : "light";
  } catch {
    return "light";
  }
};

const validateField = (
  name,
  value,
  currentForm
) => {
  const stringValue =
    typeof value === "string"
      ? value.trim()
      : value;

  switch (name) {
    case "title": {
      if (!stringValue) {
        return "Interview title is required.";
      }

      if (
        stringValue.length < 10
      ) {
        return "Title should contain at least 10 characters.";
      }

      if (
        stringValue.length > 250
      ) {
        return "Title cannot exceed 250 characters.";
      }

      return "";
    }

    case "company": {
      if (!stringValue) {
        return "Company name is required.";
      }

      if (
        stringValue.length < 2
      ) {
        return "Please enter a valid company name.";
      }

      if (
        stringValue.length > 150
      ) {
        return "Company name cannot exceed 150 characters.";
      }

      return "";
    }

    case "role": {
      if (!stringValue) {
        return "Role is required.";
      }

      if (
        stringValue.length < 2
      ) {
        return "Please enter a valid role.";
      }

      if (
        stringValue.length > 150
      ) {
        return "Role cannot exceed 150 characters.";
      }

      return "";
    }

    case "name": {
      if (!stringValue) {
        return "Your name is required.";
      }

      if (
        stringValue.length < 2
      ) {
        return "Please enter a valid name.";
      }

      if (
        stringValue.length > 120
      ) {
        return "Name cannot exceed 120 characters.";
      }

      return "";
    }

    case "email": {
      if (!stringValue) {
        return "Email address is required.";
      }

      if (
        !EMAIL_REGEX.test(
          stringValue
        )
      ) {
        return "Please enter a valid email address.";
      }

      return "";
    }

    case "mobile": {
      if (!stringValue) {
        return "Mobile number is required.";
      }

      if (
        !MOBILE_REGEX.test(
          stringValue
        )
      ) {
        return "Please enter a valid mobile number.";
      }

      const digits =
        getMobileDigits(
          stringValue
        );

      if (
        digits.length < 7 ||
        digits.length > 15
      ) {
        return "Mobile number should contain 7 to 15 digits.";
      }

      return "";
    }

    case "publicName": {
      if (
        !currentForm.isAnonymous &&
        stringValue &&
        stringValue.length > 120
      ) {
        return "Public display name cannot exceed 120 characters.";
      }

      return "";
    }

    case "experienceYears": {
      if (
        value === "" ||
        value === null ||
        value === undefined
      ) {
        return "";
      }

      const numberValue =
        Number(value);

      if (
        !Number.isInteger(
          numberValue
        )
      ) {
        return "Experience years must be a whole number.";
      }

      if (
        numberValue < 0 ||
        numberValue > 50
      ) {
        return "Experience years must be between 0 and 50.";
      }

      return "";
    }

    case "experienceMonths": {
      if (
        value === "" ||
        value === null ||
        value === undefined
      ) {
        return "";
      }

      const numberValue =
        Number(value);

      if (
        !Number.isInteger(
          numberValue
        )
      ) {
        return "Experience months must be a whole number.";
      }

      if (
        numberValue < 0 ||
        numberValue > 11
      ) {
        return "Experience months must be between 0 and 11.";
      }

      return "";
    }

    case "interviewDate": {
      if (!value) {
        return "";
      }

      const selectedDate =
        new Date(
          `${value}T00:00:00`
        );

      if (
        Number.isNaN(
          selectedDate.getTime()
        )
      ) {
        return "Please enter a valid interview date.";
      }

      const today =
        new Date();

      today.setHours(
        23,
        59,
        59,
        999
      );

      if (
        selectedDate > today
      ) {
        return "Interview date cannot be in the future.";
      }

      return "";
    }

    case "content": {
      if (!stringValue) {
        return "Interview experience is required.";
      }

      if (
        stringValue.length < 100
      ) {
        return "Please write at least 100 characters.";
      }

      if (
        stringValue.length >
        50000
      ) {
        return "Interview experience cannot exceed 50,000 characters.";
      }

      return "";
    }

    default:
      return "";
  }
};

const validateEntireForm = (
  form
) => {
  const fields = [
    "title",
    "company",
    "role",
    "name",
    "email",
    "mobile",
    "publicName",
    "experienceYears",
    "experienceMonths",
    "interviewDate",
    "content",
  ];

  const nextErrors = {};

  fields.forEach((field) => {
    const error =
      validateField(
        field,
        form[field],
        form
      );

    if (error) {
      nextErrors[field] =
        error;
    }
  });

  return nextErrors;
};

const InputField = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  isRequired = false,
  icon: Icon,
  error,
  inputMode,
  isDark,
  autoComplete,
  max,
}) => {
  return (
    <div className="min-w-0 space-y-2">
      <label
        htmlFor={name}
        className={`flex items-center gap-2 text-sm font-bold ${
          isDark
            ? "text-slate-200"
            : "text-slate-800"
        }`}
      >
        {Icon && (
          <Icon className="h-4 w-4 shrink-0 text-blue-500" />
        )}

        <span>
          {label}
        </span>

        {isRequired && (
          <span
            className="text-red-500"
            aria-hidden="true"
          >
            *
          </span>
        )}
      </label>

      <input
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        max={max}
        placeholder={placeholder}
        aria-required={
          isRequired
            ? "true"
            : undefined
        }
        aria-invalid={
          error
            ? "true"
            : "false"
        }
        aria-describedby={
          error
            ? `${name}-error`
            : undefined
        }
        className={`min-h-[48px] w-full rounded-xl border px-4 py-3 text-sm outline-none transition ${
          isDark
            ? "bg-slate-950 text-slate-100 placeholder:text-slate-600"
            : "bg-white text-slate-900 placeholder:text-slate-400"
        } ${
          error
            ? isDark
              ? "border-red-500 bg-red-950/10 focus:border-red-400 focus:ring-4 focus:ring-red-500/10"
              : "border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
            : isDark
              ? "border-slate-700 hover:border-slate-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              : "border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
        }`}
      />

      {error && (
        <p
          id={`${name}-error`}
          role="alert"
          className={`flex items-start gap-1.5 text-xs font-medium leading-5 ${
            isDark
              ? "text-red-400"
              : "text-red-600"
          }`}
        >
          <span
            className="mt-[1px]"
            aria-hidden="true"
          >
            •
          </span>

          <span>
            {error}
          </span>
        </p>
      )}
    </div>
  );
};

const SelectField = ({
  label,
  name,
  value,
  onChange,
  options,
  icon: Icon,
  error,
  isDark,
}) => {
  return (
    <div className="min-w-0 space-y-2">
      <label
        htmlFor={name}
        className={`flex items-center gap-2 text-sm font-bold ${
          isDark
            ? "text-slate-200"
            : "text-slate-800"
        }`}
      >
        {Icon && (
          <Icon className="h-4 w-4 shrink-0 text-blue-500" />
        )}

        {label}
      </label>

      <div className="relative">
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          aria-invalid={
            error
              ? "true"
              : "false"
          }
          aria-describedby={
            error
              ? `${name}-error`
              : undefined
          }
          className={`min-h-[48px] w-full appearance-none rounded-xl border px-4 py-3 pr-10 text-sm outline-none transition ${
            isDark
              ? "bg-slate-950 text-slate-100"
              : "bg-white text-slate-900"
          } ${
            error
              ? isDark
                ? "border-red-500 focus:border-red-400 focus:ring-4 focus:ring-red-500/10"
                : "border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
              : isDark
                ? "border-slate-700 hover:border-slate-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                : "border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          }`}
        >
          {options.map(
            (option) => (
              <option
                key={
                  option.value
                }
                value={
                  option.value
                }
              >
                {option.label}
              </option>
            )
          )}
        </select>

        <ChevronDown
          className={`pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 ${
            isDark
              ? "text-slate-500"
              : "text-slate-400"
          }`}
        />
      </div>

      {error && (
        <p
          id={`${name}-error`}
          role="alert"
          className={`text-xs font-medium ${
            isDark
              ? "text-red-400"
              : "text-red-600"
          }`}
        >
          {error}
        </p>
      )}
    </div>
  );
};

const SectionHeader = ({
  icon: Icon,
  title,
  description,
  isDark,
}) => {
  return (
    <div className="mb-5 flex items-start gap-3 sm:mb-6">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
          isDark
            ? "bg-blue-500/10 ring-1 ring-inset ring-blue-500/20"
            : "bg-blue-50"
        }`}
      >
        <Icon className="h-5 w-5 text-blue-500" />
      </div>

      <div className="min-w-0">
        <h2
          className={`text-base font-black sm:text-lg ${
            isDark
              ? "text-white"
              : "text-slate-900"
          }`}
        >
          {title}
        </h2>

        {description && (
          <p
            className={`mt-1 text-xs leading-5 sm:text-sm sm:leading-6 ${
              isDark
                ? "text-slate-400"
                : "text-slate-500"
            }`}
          >
            {description}
          </p>
        )}
      </div>
    </div>
  );
};

const escapeHtml = (
  value = ""
) => {
  return value
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );
};

const renderInlineMarkdown = (
  value = "",
  isDark = false
) => {
  let text =
    escapeHtml(value);

  const codeParts = [];

  text = text.replace(
    /`([^`]+)`/g,
    (_, code) => {
      const index =
        codeParts.length;

      codeParts.push(
        `<code class="rounded-md ${
          isDark
            ? "bg-slate-800 text-pink-300"
            : "bg-slate-100 text-pink-700"
        } px-1.5 py-0.5 font-mono text-[0.9em] font-medium">${code}</code>`
      );

      return `@@INLINECODE${index}@@`;
    }
  );

  text = text.replace(
    /\*\*(.+?)\*\*/g,
    "<strong>$1</strong>"
  );

  text = text.replace(
    /~~(.+?)~~/g,
    "<del>$1</del>"
  );

  text = text.replace(
    /(^|[^*])\*([^*\n]+)\*/g,
    "$1<em>$2</em>"
  );

  text = text.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    `<a href="$2" target="_blank" rel="noopener noreferrer" class="font-semibold ${
      isDark
        ? "text-blue-400 hover:text-blue-300"
        : "text-blue-600 hover:text-blue-700"
    } underline underline-offset-2">$1</a>`
  );

  codeParts.forEach(
    (html, index) => {
      text = text.replace(
        `@@INLINECODE${index}@@`,
        html
      );
    }
  );

  return text;
};

const markdownToHtml = (
  markdown = "",
  isDark = false
) => {
  if (!markdown.trim()) {
    return `
      <div class="flex min-h-[300px] items-center justify-center">
        <p class="${
          isDark
            ? "text-slate-500"
            : "text-slate-400"
        } text-center text-sm">
          Your formatted preview will appear here.
        </p>
      </div>
    `;
  }

  const lines =
    markdown.split("\n");

  const output = [];

  let inCodeBlock = false;
  let codeLines = [];
  let listType = null;
  let listItems = [];

  const bodyTextClass =
    isDark
      ? "text-slate-300"
      : "text-slate-700";

  const headingClass =
    isDark
      ? "text-white"
      : "text-slate-950";

  const dividerClass =
    isDark
      ? "border-slate-800"
      : "border-slate-200";

  const flushList = () => {
    if (
      !listType ||
      listItems.length === 0
    ) {
      listType = null;
      listItems = [];
      return;
    }

    const tag =
      listType === "ol"
        ? "ol"
        : "ul";

    const classes =
      listType === "ol"
        ? "list-decimal"
        : "list-disc";

    output.push(`
      <${tag} class="${classes} my-3 space-y-2 pl-6 ${bodyTextClass}">
        ${listItems
          .map(
            (item) =>
              `<li class="leading-7">${renderInlineMarkdown(
                item,
                isDark
              )}</li>`
          )
          .join("")}
      </${tag}>
    `);

    listType = null;
    listItems = [];
  };

  const flushCode = () => {
    if (!codeLines.length) {
      return;
    }

    output.push(`
      <pre class="my-4 max-w-full overflow-x-auto rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm leading-6 text-slate-100">
        <code>${escapeHtml(
          codeLines.join(
            "\n"
          )
        )}</code>
      </pre>
    `);

    codeLines = [];
  };

  lines.forEach((line) => {
    if (
      line
        .trim()
        .startsWith("```")
    ) {
      flushList();

      if (inCodeBlock) {
        flushCode();
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }

      return;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      return;
    }

    if (
      /^\s*(---|\*\*\*|___)\s*$/.test(
        line
      )
    ) {
      flushList();

      output.push(
        `<hr class="my-6 border-0 border-t ${dividerClass}" />`
      );

      return;
    }

    const h1 =
      line.match(
        /^# (.+)$/
      );

    if (h1) {
      flushList();

      output.push(`
        <h1 class="mb-3 mt-6 break-words text-2xl font-black tracking-tight ${headingClass} sm:text-3xl">
          ${renderInlineMarkdown(
            h1[1],
            isDark
          )}
        </h1>
      `);

      return;
    }

    const h2 =
      line.match(
        /^## (.+)$/
      );

    if (h2) {
      flushList();

      output.push(`
        <h2 class="mb-3 mt-6 break-words text-xl font-black ${headingClass} sm:text-2xl">
          ${renderInlineMarkdown(
            h2[1],
            isDark
          )}
        </h2>
      `);

      return;
    }

    const h3 =
      line.match(
        /^### (.+)$/
      );

    if (h3) {
      flushList();

      output.push(`
        <h3 class="mb-2 mt-5 break-words text-lg font-bold ${headingClass}">
          ${renderInlineMarkdown(
            h3[1],
            isDark
          )}
        </h3>
      `);

      return;
    }

    const quote =
      line.match(
        /^>\s?(.*)$/
      );

    if (
      quote &&
      quote[1]
    ) {
      flushList();

      output.push(`
        <blockquote class="my-4 rounded-r-xl border-l-4 border-blue-500 ${
          isDark
            ? "bg-blue-950/20 text-slate-300"
            : "bg-blue-50 text-slate-700"
        } px-4 py-3 leading-7">
          ${renderInlineMarkdown(
            quote[1],
            isDark
          )}
        </blockquote>
      `);

      return;
    }

    const bullet =
      line.match(
        /^\s*[-*]\s+(.+)$/
      );

    if (bullet) {
      if (
        listType &&
        listType !== "ul"
      ) {
        flushList();
      }

      listType = "ul";
      listItems.push(
        bullet[1]
      );

      return;
    }

    const numbered =
      line.match(
        /^\s*\d+\.\s+(.+)$/
      );

    if (numbered) {
      if (
        listType &&
        listType !== "ol"
      ) {
        flushList();
      }

      listType = "ol";

      listItems.push(
        numbered[1]
      );

      return;
    }

    flushList();

    if (!line.trim()) {
      output.push(
        '<div class="h-3"></div>'
      );

      return;
    }

    output.push(`
      <p class="break-words leading-7 ${bodyTextClass}">
        ${renderInlineMarkdown(
          line,
          isDark
        )}
      </p>
    `);
  });

  flushList();

  if (inCodeBlock) {
    flushCode();
  }

  return output.join("");
};

const ToolbarButton = ({
  icon: Icon,
  label,
  onClick,
  isDark,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition active:scale-95 ${
        isDark
          ? "text-slate-400 hover:bg-slate-800 hover:text-white"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
      }`}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
};

const MarkdownEditor = ({
  value,
  onChange,
  error,
  isDark,
}) => {
  const textareaRef =
    useRef(null);

  const [mode, setMode] =
    useState("write");

  const restoreSelection = (
    start,
    end
  ) => {
    requestAnimationFrame(
      () => {
        const textarea =
          textareaRef.current;

        if (!textarea) {
          return;
        }

        textarea.focus();

        textarea.setSelectionRange(
          start,
          end
        );
      }
    );
  };

  const applyInline = (
    before,
    after = before,
    placeholder = "text"
  ) => {
    const textarea =
      textareaRef.current;

    if (!textarea) {
      return;
    }

    const start =
      textarea.selectionStart;

    const end =
      textarea.selectionEnd;

    const selected =
      value.slice(
        start,
        end
      ) || placeholder;

    const nextValue =
      value.slice(
        0,
        start
      ) +
      before +
      selected +
      after +
      value.slice(end);

    onChange(nextValue);

    const contentStart =
      start +
      before.length;

    restoreSelection(
      contentStart,
      contentStart +
        selected.length
    );
  };

  const applyLinePrefix = (
    prefix,
    placeholder
  ) => {
    const textarea =
      textareaRef.current;

    if (!textarea) {
      return;
    }

    const start =
      textarea.selectionStart;

    const end =
      textarea.selectionEnd;

    const lineStart =
      value.lastIndexOf(
        "\n",
        Math.max(
          0,
          start - 1
        )
      ) + 1;

    let selected =
      value.slice(
        lineStart,
        end
      );

    if (!selected) {
      selected = placeholder;
    }

    const formatted =
      selected
        .split("\n")
        .map((line) => {
          if (
            !line.trim()
          ) {
            return line;
          }

          return `${prefix}${line}`;
        })
        .join("\n");

    const nextValue =
      value.slice(
        0,
        lineStart
      ) +
      formatted +
      value.slice(end);

    onChange(nextValue);

    restoreSelection(
      lineStart,
      lineStart +
        formatted.length
    );
  };

  const applyNumberedList =
    () => {
      const textarea =
        textareaRef.current;

      if (!textarea) {
        return;
      }

      const start =
        textarea.selectionStart;

      const end =
        textarea.selectionEnd;

      const lineStart =
        value.lastIndexOf(
          "\n",
          Math.max(
            0,
            start - 1
          )
        ) + 1;

      let selected =
        value.slice(
          lineStart,
          end
        );

      if (!selected) {
        selected =
          "List item";
      }

      const formatted =
        selected
          .split("\n")
          .map(
            (
              line,
              index
            ) =>
              line.trim()
                ? `${
                    index + 1
                  }. ${line}`
                : line
          )
          .join("\n");

      const nextValue =
        value.slice(
          0,
          lineStart
        ) +
        formatted +
        value.slice(end);

      onChange(nextValue);

      restoreSelection(
        lineStart,
        lineStart +
          formatted.length
      );
    };

  const insertAtCursor = (
    insertText,
    selectionOffset = null
  ) => {
    const textarea =
      textareaRef.current;

    if (!textarea) {
      return;
    }

    const start =
      textarea.selectionStart;

    const end =
      textarea.selectionEnd;

    const nextValue =
      value.slice(
        0,
        start
      ) +
      insertText +
      value.slice(end);

    onChange(nextValue);

    const cursor =
      start +
      (selectionOffset ??
        insertText.length);

    restoreSelection(
      cursor,
      cursor
    );
  };

  const insertCodeBlock =
    () => {
      const textarea =
        textareaRef.current;

      if (!textarea) {
        return;
      }

      const start =
        textarea.selectionStart;

      const end =
        textarea.selectionEnd;

      const selected =
        value.slice(
          start,
          end
        ) ||
        "your code here";

      const before =
        "\n\n```\n";

      const after =
        "\n```\n\n";

      const nextValue =
        value.slice(
          0,
          start
        ) +
        before +
        selected +
        after +
        value.slice(end);

      onChange(nextValue);

      restoreSelection(
        start +
          before.length,
        start +
          before.length +
          selected.length
      );
    };

  const insertLink = () => {
    const textarea =
      textareaRef.current;

    if (!textarea) {
      return;
    }

    const start =
      textarea.selectionStart;

    const end =
      textarea.selectionEnd;

    const selected =
      value.slice(
        start,
        end
      ) ||
      "link text";

    const prefix = "[";
    const middle = "](";
    const url =
      "https://example.com";
    const suffix = ")";

    const insertText =
      `${prefix}${selected}${middle}${url}${suffix}`;

    const nextValue =
      value.slice(
        0,
        start
      ) +
      insertText +
      value.slice(end);

    onChange(nextValue);

    const urlStart =
      start +
      prefix.length +
      selected.length +
      middle.length;

    restoreSelection(
      urlStart,
      urlStart +
        url.length
    );
  };

  const characterCount =
    value.length;

  return (
    <div className="min-w-0 space-y-2">
      <label
        htmlFor="content"
        className={`flex items-center gap-2 text-sm font-bold ${
          isDark
            ? "text-slate-200"
            : "text-slate-800"
        }`}
      >
        Interview Experience

        <span
          className="text-red-500"
          aria-hidden="true"
        >
          *
        </span>
      </label>

      <div
        className={`min-w-0 overflow-hidden rounded-xl border transition sm:rounded-2xl ${
          isDark
            ? "bg-slate-950"
            : "bg-white"
        } ${
          error
            ? isDark
              ? "border-red-500 ring-4 ring-red-500/5"
              : "border-red-400 ring-4 ring-red-500/5"
            : isDark
              ? "border-slate-700 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10"
              : "border-slate-200 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10"
        }`}
      >
        <div
          className={`flex flex-wrap items-center justify-between gap-2 border-b px-2.5 py-2 sm:px-3 ${
            isDark
              ? "border-slate-800 bg-slate-900"
              : "border-slate-200 bg-slate-50"
          }`}
        >
          <div
            className={`flex rounded-lg p-1 ${
              isDark
                ? "bg-slate-800"
                : "bg-slate-200/70"
            }`}
          >
            <button
              type="button"
              onClick={() =>
                setMode(
                  "write"
                )
              }
              aria-pressed={
                mode ===
                "write"
              }
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-bold transition sm:px-3 ${
                mode ===
                "write"
                  ? isDark
                    ? "bg-slate-700 text-white shadow-sm"
                    : "bg-white text-slate-900 shadow-sm"
                  : isDark
                    ? "text-slate-400 hover:text-white"
                    : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Pencil className="h-3.5 w-3.5" />
              Write
            </button>

            <button
              type="button"
              onClick={() =>
                setMode(
                  "preview"
                )
              }
              aria-pressed={
                mode ===
                "preview"
              }
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-bold transition sm:px-3 ${
                mode ===
                "preview"
                  ? isDark
                    ? "bg-slate-700 text-white shadow-sm"
                    : "bg-white text-slate-900 shadow-sm"
                  : isDark
                    ? "text-slate-400 hover:text-white"
                    : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Eye className="h-3.5 w-3.5" />
              Preview
            </button>
          </div>

          <span
            className={`hidden text-xs sm:block ${
              isDark
                ? "text-slate-500"
                : "text-slate-400"
            }`}
          >
            Markdown formatting
            supported
          </span>
        </div>

        {mode === "write" && (
          <>
            <div
              className={`max-w-full overflow-x-auto border-b ${
                isDark
                  ? "border-slate-800 bg-slate-900/70"
                  : "border-slate-200 bg-white"
              }`}
            >
              <div className="flex min-w-max items-center gap-1 px-2.5 py-2 sm:px-3">
                <ToolbarButton
                  icon={Heading1}
                  label="Heading 1"
                  isDark={isDark}
                  onClick={() =>
                    applyLinePrefix(
                      "# ",
                      "Main heading"
                    )
                  }
                />

                <ToolbarButton
                  icon={Heading2}
                  label="Heading 2"
                  isDark={isDark}
                  onClick={() =>
                    applyLinePrefix(
                      "## ",
                      "Section heading"
                    )
                  }
                />

                <span
                  className={`mx-1 h-5 w-px ${
                    isDark
                      ? "bg-slate-700"
                      : "bg-slate-200"
                  }`}
                />

                <ToolbarButton
                  icon={Bold}
                  label="Bold"
                  isDark={isDark}
                  onClick={() =>
                    applyInline(
                      "**",
                      "**",
                      "bold text"
                    )
                  }
                />

                <ToolbarButton
                  icon={Italic}
                  label="Italic"
                  isDark={isDark}
                  onClick={() =>
                    applyInline(
                      "*",
                      "*",
                      "italic text"
                    )
                  }
                />

                <ToolbarButton
                  icon={
                    Strikethrough
                  }
                  label="Strikethrough"
                  isDark={isDark}
                  onClick={() =>
                    applyInline(
                      "~~",
                      "~~",
                      "strikethrough"
                    )
                  }
                />

                <span
                  className={`mx-1 h-5 w-px ${
                    isDark
                      ? "bg-slate-700"
                      : "bg-slate-200"
                  }`}
                />

                <ToolbarButton
                  icon={List}
                  label="Bullet list"
                  isDark={isDark}
                  onClick={() =>
                    applyLinePrefix(
                      "- ",
                      "List item"
                    )
                  }
                />

                <ToolbarButton
                  icon={
                    ListOrdered
                  }
                  label="Numbered list"
                  isDark={isDark}
                  onClick={
                    applyNumberedList
                  }
                />

                <ToolbarButton
                  icon={Quote}
                  label="Quote"
                  isDark={isDark}
                  onClick={() =>
                    applyLinePrefix(
                      "> ",
                      "Important note"
                    )
                  }
                />

                <span
                  className={`mx-1 h-5 w-px ${
                    isDark
                      ? "bg-slate-700"
                      : "bg-slate-200"
                  }`}
                />

                <ToolbarButton
                  icon={Code2}
                  label="Inline code"
                  isDark={isDark}
                  onClick={() =>
                    applyInline(
                      "`",
                      "`",
                      "code"
                    )
                  }
                />

                <button
                  type="button"
                  onClick={
                    insertCodeBlock
                  }
                  title="Code block"
                  aria-label="Code block"
                  className={`flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg px-2.5 text-xs font-bold transition active:scale-95 ${
                    isDark
                      ? "text-slate-400 hover:bg-slate-800 hover:text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                  }`}
                >
                  <Code2 className="h-4 w-4" />
                  Code
                </button>

                <ToolbarButton
                  icon={Link2}
                  label="Insert link"
                  isDark={isDark}
                  onClick={
                    insertLink
                  }
                />

                <span
                  className={`mx-1 h-5 w-px ${
                    isDark
                      ? "bg-slate-700"
                      : "bg-slate-200"
                  }`}
                />

                <ToolbarButton
                  icon={Minus}
                  label="Horizontal line"
                  isDark={isDark}
                  onClick={() =>
                    insertAtCursor(
                      "\n\n---\n\n"
                    )
                  }
                />

                <ToolbarButton
                  icon={Pilcrow}
                  label="Paragraph spacing"
                  isDark={isDark}
                  onClick={() =>
                    insertAtCursor(
                      "\n\n"
                    )
                  }
                />
              </div>
            </div>

            <textarea
              ref={textareaRef}
              id="content"
              name="content"
              value={value}
              onChange={(event) =>
                onChange(
                  event.target
                    .value
                )
              }
              rows={20}
              spellCheck
              aria-invalid={
                error
                  ? "true"
                  : "false"
              }
              aria-describedby={
                error
                  ? "content-error"
                  : "content-help"
              }
              placeholder={`Example:

# Mastercard AI Engineer Interview Experience

I recently interviewed for an **AI Engineer** role.

---

## Round 1 - Online Assessment

There were two DSA questions:

1. Arrays / Hashing problem
2. Graph problem

**Duration:** 60 minutes
**Difficulty:** Medium

---

## Round 2 - GenAI

The interviewer focused on:

- RAG architecture
- MCP
- Vector databases
- Google ADK

> The discussion on RAG and MCP lasted around 30 minutes.

## Preparation

I mainly focused on:

- DSA
- System Design
- RAG
- MCP

## Advice

Be comfortable explaining your projects in depth and discussing trade-offs.`}
              className={`min-h-[420px] w-full resize-y border-0 px-4 py-5 font-mono text-sm leading-7 outline-none sm:min-h-[480px] sm:px-5 ${
                isDark
                  ? "bg-slate-950 text-slate-100 placeholder:text-slate-600"
                  : "bg-white text-slate-900 placeholder:text-slate-400"
              } placeholder:font-sans`}
            />
          </>
        )}

        {mode ===
          "preview" && (
          <div
            className={`min-h-[420px] min-w-0 max-w-full overflow-hidden px-4 py-5 sm:min-h-[480px] sm:px-7 sm:py-6 ${
              isDark
                ? "bg-slate-950"
                : "bg-white"
            }`}
          >
            <div
              className="min-w-0 max-w-full"
              dangerouslySetInnerHTML={{
                __html:
                  markdownToHtml(
                    value,
                    isDark
                  ),
              }}
            />
          </div>
        )}

        <div
          className={`flex flex-wrap items-center justify-between gap-2 border-t px-3 py-2.5 sm:px-4 ${
            isDark
              ? "border-slate-800 bg-slate-900"
              : "border-slate-200 bg-slate-50"
          }`}
        >
          <p
            id="content-help"
            className={`text-[11px] sm:text-xs ${
              isDark
                ? "text-slate-500"
                : "text-slate-500"
            }`}
          >
            Minimum 100
            characters.
          </p>

          <p
            className={`text-[11px] font-bold sm:text-xs ${
              characterCount >=
              100
                ? isDark
                  ? "text-emerald-400"
                  : "text-green-600"
                : error
                  ? isDark
                    ? "text-red-400"
                    : "text-red-600"
                  : isDark
                    ? "text-slate-500"
                    : "text-slate-500"
            }`}
          >
            {characterCount.toLocaleString()}
            {" / "}
            50,000
          </p>
        </div>
      </div>

      {error && (
        <p
          id="content-error"
          role="alert"
          className={`flex items-start gap-1.5 text-xs font-medium leading-5 ${
            isDark
              ? "text-red-400"
              : "text-red-600"
          }`}
        >
          <span
            aria-hidden="true"
          >
            •
          </span>

          <span>
            {error}
          </span>
        </p>
      )}
    </div>
  );
};

const AddInterviewExperience =
  () => {
    const [theme, setTheme] =
      useState(
        getStoredTheme
      );

    const [form, setForm] =
      useState(initialForm);

    const [errors, setErrors] =
      useState({});

    const [
      submitting,
      setSubmitting,
    ] = useState(false);

    const [
      submitted,
      setSubmitted,
    ] = useState(false);

    const isDark =
      theme === "dark";

    const ENDPOINT =
      useMemo(() => {
        const cleanBase =
          BASE_URL.endsWith(
            "/"
          )
            ? BASE_URL.slice(
                0,
                -1
              )
            : BASE_URL;

        return `${cleanBase}/api/interview`;
      }, []);

    useEffect(() => {
      const syncTheme = () => {
        const currentTheme =
          getStoredTheme();

        setTheme(
          (
            previousTheme
          ) =>
            previousTheme !==
            currentTheme
              ? currentTheme
              : previousTheme
        );
      };

      const handleStorage = (
        event
      ) => {
        if (
          event.key ===
            "theme" ||
          event.key === null
        ) {
          syncTheme();
        }
      };

      const handleVisibility =
        () => {
          if (
            !document.hidden
          ) {
            syncTheme();
          }
        };

      syncTheme();

      const intervalId =
        window.setInterval(
          syncTheme,
          200
        );

      window.addEventListener(
        "storage",
        handleStorage
      );

      window.addEventListener(
        "focus",
        syncTheme
      );

      window.addEventListener(
        "themechange",
        syncTheme
      );

      window.addEventListener(
        "theme-change",
        syncTheme
      );

      document.addEventListener(
        "visibilitychange",
        handleVisibility
      );

      return () => {
        window.clearInterval(
          intervalId
        );

        window.removeEventListener(
          "storage",
          handleStorage
        );

        window.removeEventListener(
          "focus",
          syncTheme
        );

        window.removeEventListener(
          "themechange",
          syncTheme
        );

        window.removeEventListener(
          "theme-change",
          syncTheme
        );

        document.removeEventListener(
          "visibilitychange",
          handleVisibility
        );
      };
    }, []);

    const updateField = (
      name,
      value
    ) => {
      const nextForm = {
        ...form,
        [name]: value,
      };

      setForm(nextForm);

      if (submitted) {
        setSubmitted(false);
      }

      if (errors[name]) {
        const nextError =
          validateField(
            name,
            value,
            nextForm
          );

        setErrors(
          (previous) => {
            const next = {
              ...previous,
            };

            if (nextError) {
              next[name] =
                nextError;
            } else {
              delete next[
                name
              ];
            }

            return next;
          }
        );
      }

      if (errors.submit) {
        setErrors(
          (previous) => {
            const next = {
              ...previous,
            };

            delete next.submit;

            return next;
          }
        );
      }
    };

    const handleChange = (
      event
    ) => {
      const {
        name,
        value,
        type,
        checked,
      } = event.target;

      updateField(
        name,
        type === "checkbox"
          ? checked
          : value
      );

      if (
        name ===
          "isAnonymous" &&
        checked
      ) {
        setErrors(
          (previous) => {
            const next = {
              ...previous,
            };

            delete next.publicName;

            return next;
          }
        );
      }
    };

    const handleContentChange =
      (value) => {
        updateField(
          "content",
          value
        );
      };

    const scrollToFirstError =
      (
        validationErrors
      ) => {
        const firstField =
          Object.keys(
            validationErrors
          )[0];

        if (!firstField) {
          return;
        }

        window.setTimeout(
          () => {
            const element =
              document.getElementById(
                firstField
              );

            element?.scrollIntoView(
              {
                behavior:
                  "smooth",
                block:
                  "center",
              }
            );

            element?.focus?.();
          },
          50
        );
      };

    const handleSubmit =
      async (event) => {
        event.preventDefault();

        if (submitting) {
          return;
        }

        const validationErrors =
          validateEntireForm(
            form
          );

        if (
          Object.keys(
            validationErrors
          ).length > 0
        ) {
          setErrors(
            validationErrors
          );

          scrollToFirstError(
            validationErrors
          );

          toast.error(
            "Please fix the highlighted fields."
          );

          return;
        }

        setErrors({});
        setSubmitting(true);

        try {
          const payload = {
            title:
              form.title.trim(),

            company:
              form.company.trim(),

            role:
              form.role.trim(),

            name:
              form.name.trim(),

            email:
              form.email
                .trim()
                .toLowerCase(),

            mobile:
              form.mobile.trim(),

            isAnonymous:
              form.isAnonymous,

            publicName:
              form.isAnonymous
                ? ""
                : form.publicName.trim() ||
                  form.name.trim(),

            experienceYears:
              form.experienceYears ===
              ""
                ? null
                : Number(
                    form.experienceYears
                  ),

            experienceMonths:
              form.experienceMonths ===
              ""
                ? null
                : Number(
                    form.experienceMonths
                  ),

            location:
              form.location.trim(),

            country:
              form.country.trim(),

            interviewDate:
              form.interviewDate ||
              null,

            applicationSource:
              form.applicationSource.trim(),

            interviewMode:
              form.interviewMode,

            difficulty:
              form.difficulty,

            result:
              form.result,

            content:
              form.content.trim(),
          };

          const response =
            await fetch(
              ENDPOINT,
              {
                method:
                  "POST",

                headers: {
                  "Content-Type":
                    "application/json",
                },

                body:
                  JSON.stringify(
                    payload
                  ),
              }
            );

          let data = {};

          try {
            data =
              await response.json();
          } catch {
            data = {};
          }

          if (
            !response.ok
          ) {
            let message =
              data?.message ||
              "Unable to submit interview experience.";

            if (
              response.status ===
              429
            ) {
              const minutes =
                data?.retryAfterMinutes;

              message =
                minutes
                  ? `You have reached the submission limit. Please try again in approximately ${minutes} minutes.`
                  : "You can submit a maximum of 3 interview experiences within 6 hours.";
            }

            if (
              data?.code ===
              "DUPLICATE_SUBMISSION"
            ) {
              message =
                "A similar interview experience was submitted recently.";
            }

            if (
              data?.code ===
              "DUPLICATE_CONTENT"
            ) {
              message =
                "This interview experience appears to have already been submitted.";
            }

            setErrors(
              (previous) => ({
                ...previous,
                submit:
                  message,
              })
            );

            toast.error(
              message,
              {
                duration:
                  6000,
              }
            );

            return;
          }

          toast.success(
            "Interview experience submitted successfully!",
            {
              duration: 5000,
            }
          );

          setSubmitted(true);

          setErrors({});

          setForm({
            ...initialForm,
          });

          window.scrollTo({
            top: 0,
            behavior:
              "smooth",
          });
        } catch (error) {
          console.error(
            "Interview submission error:",
            error
          );

          const message =
            "Something went wrong while submitting. Please try again.";

          setErrors(
            (previous) => ({
              ...previous,
              submit: message,
            })
          );

          toast.error(
            message
          );
        } finally {
          setSubmitting(
            false
          );
        }
      };

    const today =
      new Date()
        .toISOString()
        .split("T")[0];

    const webpageSchema = {
      "@context":
        "https://schema.org",
      "@type": "WebPage",
      name: "Share Software Engineering Interview Experience",
      headline:
        "Share Your Interview Experience",
      description:
        "Share your software engineering, backend, frontend, system design, AI or GenAI interview experience with the TargetTrek engineering community.",
      url: CANONICAL_URL,
      inLanguage: "en-IN",
      isPartOf: {
        "@type": "WebSite",
        name: "TargetTrek",
        url: SITE_URL,
      },
      publisher: {
        "@type":
          "Organization",
        name: "TargetTrek",
        url: SITE_URL,
      },
      about: [
        "Software Engineering Interviews",
        "SDE Interviews",
        "Backend Interviews",
        "System Design Interviews",
        "AI Engineer Interviews",
        "GenAI Interviews",
      ],
    };

    const breadcrumbSchema = {
      "@context":
        "https://schema.org",
      "@type":
        "BreadcrumbList",
      itemListElement: [
        {
          "@type":
            "ListItem",
          position: 1,
          name: "TargetTrek",
          item: SITE_URL,
        },
        {
          "@type":
            "ListItem",
          position: 2,
          name: "Interview Experiences",
          item: `${SITE_URL}/interviews`,
        },
        {
          "@type":
            "ListItem",
          position: 3,
          name: "Share Interview Experience",
          item: CANONICAL_URL,
        },
      ],
    };

    return (
      <>
        <Helmet>
          <html
            lang="en"
            data-theme={
              theme
            }
          />

          <title>
            Share Software
            Engineering Interview
            Experience | TargetTrek
          </title>

          <meta
            name="description"
            content="Share your software engineering interview experience on TargetTrek. Add interview rounds, DSA, LLD, HLD, backend, AI, GenAI questions, preparation strategy, difficulty and candidate advice."
          />

          <meta
            name="keywords"
            content="share interview experience, software engineer interview experience, SDE interview experience, backend interview, system design interview, DSA interview questions, LLD interview, HLD interview, AI engineer interview, GenAI interview, TargetTrek interviews"
          />

          <meta
            name="robots"
            content="index,follow,max-image-preview:large,max-snippet:-1"
          />

          <meta
            name="author"
            content="TargetTrek"
          />

          <meta
            name="theme-color"
            content={
              isDark
                ? "#0b0f17"
                : "#f8fafc"
            }
          />

          <link
            rel="canonical"
            href={
              CANONICAL_URL
            }
          />

          <meta
            property="og:type"
            content="website"
          />

          <meta
            property="og:site_name"
            content="TargetTrek"
          />

          <meta
            property="og:locale"
            content="en_IN"
          />

          <meta
            property="og:title"
            content="Share Your Interview Experience | TargetTrek"
          />

          <meta
            property="og:description"
            content="Help engineers prepare better by sharing your real software engineering interview rounds, questions, preparation and advice."
          />

          <meta
            property="og:url"
            content={
              CANONICAL_URL
            }
          />

          <meta
            name="twitter:card"
            content="summary"
          />

          <meta
            name="twitter:title"
            content="Share Your Interview Experience | TargetTrek"
          />

          <meta
            name="twitter:description"
            content="Share your interview rounds, questions, preparation and advice with the TargetTrek engineering community."
          />

          <script type="application/ld+json">
            {JSON.stringify(
              webpageSchema
            )}
          </script>

          <script type="application/ld+json">
            {JSON.stringify(
              breadcrumbSchema
            )}
          </script>
        </Helmet>

        <div
          className={`min-h-screen pt-20 transition-colors duration-300 sm:pt-24 ${
            isDark
              ? "bg-[#0b0f17] text-slate-100"
              : "bg-slate-50 text-slate-900"
          }`}
        >
          <div className="mx-auto max-w-7xl px-3 pt-4 sm:px-6 lg:px-8">
            <nav
              aria-label="Breadcrumb"
              className={`flex min-w-0 items-center gap-1.5 overflow-hidden text-xs font-medium ${
                isDark
                  ? "text-slate-400"
                  : "text-slate-500"
              }`}
            >
              <Link
                to="/"
                className={`shrink-0 transition ${
                  isDark
                    ? "hover:text-blue-400"
                    : "hover:text-blue-600"
                }`}
              >
                TargetTrek
              </Link>

              <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-50" />

              <Link
                to="/interviews"
                className={`shrink-0 transition ${
                  isDark
                    ? "hover:text-blue-400"
                    : "hover:text-blue-600"
                }`}
              >
                Interviews
              </Link>

              <ChevronRight className="hidden h-3.5 w-3.5 shrink-0 opacity-50 sm:block" />

              <span
                className={`hidden truncate sm:block ${
                  isDark
                    ? "text-slate-500"
                    : "text-slate-400"
                }`}
              >
                Share experience
              </span>
            </nav>
          </div>

          <section
            className={`mt-3 border-y transition-colors ${
              isDark
                ? "border-slate-800 bg-slate-900/60"
                : "border-slate-200 bg-white"
            }`}
          >
            <div className="mx-auto max-w-7xl px-3 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
              <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-12">
                <div>
                  <Link
                    to="/interviews"
                    className={`mb-5 inline-flex items-center gap-2 text-sm font-bold transition ${
                      isDark
                        ? "text-slate-400 hover:text-blue-400"
                        : "text-slate-500 hover:text-blue-600"
                    }`}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Browse interview
                    experiences
                  </Link>

                  <div
                    className={`mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] ${
                      isDark
                        ? "border-blue-500/20 bg-blue-500/10 text-blue-300"
                        : "border-blue-100 bg-blue-50 text-blue-700"
                    }`}
                  >
                    <BriefcaseBusiness className="h-3.5 w-3.5" />
                    TargetTrek
                    Interviews
                  </div>

                  <h1
                    className={`max-w-3xl text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-5xl ${
                      isDark
                        ? "text-white"
                        : "text-slate-950"
                    }`}
                  >
                    Share Your
                    Interview
                    Experience
                  </h1>

                  <p
                    className={`mt-4 max-w-2xl text-sm leading-7 sm:text-base lg:text-lg ${
                      isDark
                        ? "text-slate-400"
                        : "text-slate-600"
                    }`}
                  >
                    Help other
                    engineers prepare
                    better by sharing
                    the real rounds,
                    questions,
                    difficulty,
                    preparation and
                    lessons from your
                    interview.
                  </p>

                  <div className="mt-6 flex flex-wrap gap-2.5">
                    <div
                      className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-bold sm:text-sm ${
                        isDark
                          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                          : "border-emerald-100 bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      <ShieldCheck className="h-4 w-4" />
                      Reviewed before
                      publishing
                    </div>

                    <div
                      className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-bold sm:text-sm ${
                        isDark
                          ? "border-blue-500/20 bg-blue-500/10 text-blue-300"
                          : "border-blue-100 bg-blue-50 text-blue-700"
                      }`}
                    >
                      <CircleUserRound className="h-4 w-4" />
                      Anonymous
                      publishing
                    </div>
                  </div>
                </div>

                <div
                  className={`hidden rounded-3xl border p-5 shadow-sm lg:block ${
                    isDark
                      ? "border-slate-800 bg-slate-950/70"
                      : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <p
                    className={`text-sm font-black ${
                      isDark
                        ? "text-white"
                        : "text-slate-900"
                    }`}
                  >
                    A useful experience
                    includes
                  </p>

                  <div className="mt-4 space-y-3">
                    {[
                      "Interview rounds and duration",
                      "Questions and follow-ups",
                      "DSA, LLD, HLD or technical topics",
                      "Preparation strategy",
                      "Difficulty and result",
                      "Advice for future candidates",
                    ].map(
                      (item) => (
                        <div
                          key={
                            item
                          }
                          className="flex items-start gap-2.5"
                        >
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />

                          <span
                            className={`text-sm leading-5 ${
                              isDark
                                ? "text-slate-400"
                                : "text-slate-600"
                            }`}
                          >
                            {item}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {submitted && (
            <div className="mx-auto max-w-7xl px-3 pt-6 sm:px-6 lg:px-8">
              <div
                role="status"
                className={`flex items-start gap-3 rounded-2xl border p-4 sm:p-5 ${
                  isDark
                    ? "border-emerald-500/30 bg-emerald-500/10"
                    : "border-green-200 bg-green-50"
                }`}
              >
                <CheckCircle2
                  className={`mt-0.5 h-6 w-6 shrink-0 ${
                    isDark
                      ? "text-emerald-400"
                      : "text-green-600"
                  }`}
                />

                <div>
                  <h2
                    className={`font-black ${
                      isDark
                        ? "text-emerald-300"
                        : "text-green-900"
                    }`}
                  >
                    Submission
                    received
                  </h2>

                  <p
                    className={`mt-1 text-sm leading-6 ${
                      isDark
                        ? "text-emerald-200/80"
                        : "text-green-800"
                    }`}
                  >
                    Your interview
                    experience has
                    been submitted
                    for review. It
                    will become
                    public only
                    after approval.
                  </p>
                </div>
              </div>
            </div>
          )}

          <main className="mx-auto max-w-7xl px-3 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
            <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_330px]">
              <form
                noValidate
                onSubmit={
                  handleSubmit
                }
                className="min-w-0 space-y-5 sm:space-y-6"
              >
                <section
                  className={`rounded-2xl border p-4 shadow-sm sm:p-6 lg:p-7 ${
                    isDark
                      ? "border-slate-800 bg-slate-900"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <SectionHeader
                    icon={
                      BriefcaseBusiness
                    }
                    title="Interview Details"
                    description="Tell us which company and role this interview experience is about."
                    isDark={
                      isDark
                    }
                  />

                  <div className="space-y-5">
                    <InputField
                      label="Interview Title"
                      name="title"
                      value={
                        form.title
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="e.g. Amazon SDE-2 Interview Experience"
                      isRequired
                      icon={
                        FileText
                      }
                      error={
                        errors.title
                      }
                      isDark={
                        isDark
                      }
                    />

                    <div className="grid gap-5 md:grid-cols-2">
                      <InputField
                        label="Company"
                        name="company"
                        value={
                          form.company
                        }
                        onChange={
                          handleChange
                        }
                        placeholder="e.g. Amazon"
                        isRequired
                        icon={
                          Building2
                        }
                        error={
                          errors.company
                        }
                        isDark={
                          isDark
                        }
                      />

                      <InputField
                        label="Role"
                        name="role"
                        value={
                          form.role
                        }
                        onChange={
                          handleChange
                        }
                        placeholder="e.g. SDE-2"
                        isRequired
                        icon={
                          BriefcaseBusiness
                        }
                        error={
                          errors.role
                        }
                        isDark={
                          isDark
                        }
                      />
                    </div>
                  </div>
                </section>

                <section
                  className={`rounded-2xl border p-4 shadow-sm sm:p-6 lg:p-7 ${
                    isDark
                      ? "border-slate-800 bg-slate-900"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <SectionHeader
                    icon={
                      UserRound
                    }
                    title="Your Information"
                    description="Your email and mobile number are private and are never displayed publicly."
                    isDark={
                      isDark
                    }
                  />

                  <div className="grid gap-5 md:grid-cols-2">
                    <InputField
                      label="Your Name"
                      name="name"
                      value={
                        form.name
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Enter your name"
                      autoComplete="name"
                      isRequired
                      icon={
                        UserRound
                      }
                      error={
                        errors.name
                      }
                      isDark={
                        isDark
                      }
                    />

                    <InputField
                      label="Email"
                      name="email"
                      value={
                        form.email
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="you@example.com"
                      type="text"
                      inputMode="email"
                      autoComplete="email"
                      isRequired
                      icon={Mail}
                      error={
                        errors.email
                      }
                      isDark={
                        isDark
                      }
                    />

                    <InputField
                      label="Mobile Number"
                      name="mobile"
                      value={
                        form.mobile
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="+91 98XXXXXXXX"
                      type="text"
                      inputMode="tel"
                      autoComplete="tel"
                      isRequired
                      icon={Phone}
                      error={
                        errors.mobile
                      }
                      isDark={
                        isDark
                      }
                    />
                  </div>

                  <div
                    className={`mt-6 rounded-xl border p-4 ${
                      isDark
                        ? "border-blue-500/20 bg-blue-500/10"
                        : "border-blue-100 bg-blue-50/70"
                    }`}
                  >
                    <label className="flex cursor-pointer items-start gap-3">
                      <input
                        type="checkbox"
                        name="isAnonymous"
                        checked={
                          form.isAnonymous
                        }
                        onChange={
                          handleChange
                        }
                        className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />

                      <div className="min-w-0">
                        <p
                          className={`text-sm font-bold ${
                            isDark
                              ? "text-slate-100"
                              : "text-slate-900"
                          }`}
                        >
                          Publish
                          anonymously
                        </p>

                        <p
                          className={`mt-1 text-xs leading-5 ${
                            isDark
                              ? "text-slate-400"
                              : "text-slate-600"
                          }`}
                        >
                          Your name,
                          email and
                          mobile number
                          will not appear
                          on the public
                          interview page.
                        </p>
                      </div>
                    </label>

                    {!form.isAnonymous && (
                      <div className="mt-4">
                        <InputField
                          label="Public Display Name"
                          name="publicName"
                          value={
                            form.publicName
                          }
                          onChange={
                            handleChange
                          }
                          placeholder="Leave blank to use your name"
                          icon={
                            CircleUserRound
                          }
                          error={
                            errors.publicName
                          }
                          isDark={
                            isDark
                          }
                        />
                      </div>
                    )}
                  </div>
                </section>

                <section
                  className={`rounded-2xl border p-4 shadow-sm sm:p-6 lg:p-7 ${
                    isDark
                      ? "border-slate-800 bg-slate-900"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <SectionHeader
                    icon={
                      Sparkles
                    }
                    title="Additional Details"
                    description="Optional information gives readers more context about your interview."
                    isDark={
                      isDark
                    }
                  />

                  <div className="grid gap-5 sm:grid-cols-2">
                    <InputField
                      label="Experience - Years"
                      name="experienceYears"
                      value={
                        form.experienceYears
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="2"
                      type="text"
                      inputMode="numeric"
                      icon={Clock3}
                      error={
                        errors.experienceYears
                      }
                      isDark={
                        isDark
                      }
                    />

                    <InputField
                      label="Experience - Months"
                      name="experienceMonths"
                      value={
                        form.experienceMonths
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="6"
                      type="text"
                      inputMode="numeric"
                      icon={Clock3}
                      error={
                        errors.experienceMonths
                      }
                      isDark={
                        isDark
                      }
                    />

                    <InputField
                      label="Location"
                      name="location"
                      value={
                        form.location
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="e.g. Bengaluru"
                      icon={MapPin}
                      isDark={
                        isDark
                      }
                    />

                    <InputField
                      label="Country"
                      name="country"
                      value={
                        form.country
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="e.g. India"
                      icon={Globe2}
                      isDark={
                        isDark
                      }
                    />

                    <InputField
                      label="Interview Date"
                      name="interviewDate"
                      value={
                        form.interviewDate
                      }
                      onChange={
                        handleChange
                      }
                      type="date"
                      max={today}
                      icon={
                        CalendarDays
                      }
                      error={
                        errors.interviewDate
                      }
                      isDark={
                        isDark
                      }
                    />

                    <SelectField
                      label="Application Source"
                      name="applicationSource"
                      value={
                        form.applicationSource
                      }
                      onChange={
                        handleChange
                      }
                      options={
                        applicationSourceOptions
                      }
                      icon={Send}
                      isDark={
                        isDark
                      }
                    />

                    <SelectField
                      label="Interview Mode"
                      name="interviewMode"
                      value={
                        form.interviewMode
                      }
                      onChange={
                        handleChange
                      }
                      options={
                        interviewModes
                      }
                      icon={
                        BriefcaseBusiness
                      }
                      isDark={
                        isDark
                      }
                    />

                    <SelectField
                      label="Overall Difficulty"
                      name="difficulty"
                      value={
                        form.difficulty
                      }
                      onChange={
                        handleChange
                      }
                      options={
                        difficultyOptions
                      }
                      icon={
                        Sparkles
                      }
                      isDark={
                        isDark
                      }
                    />

                    <SelectField
                      label="Interview Result"
                      name="result"
                      value={
                        form.result
                      }
                      onChange={
                        handleChange
                      }
                      options={
                        resultOptions
                      }
                      icon={
                        CheckCircle2
                      }
                      isDark={
                        isDark
                      }
                    />
                  </div>
                </section>

                <section
                  className={`min-w-0 rounded-2xl border p-4 shadow-sm sm:p-6 lg:p-7 ${
                    isDark
                      ? "border-slate-800 bg-slate-900"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <SectionHeader
                    icon={
                      FileText
                    }
                    title="Your Interview Experience"
                    description="Use headings, lists, code, links and formatting to make your experience easy to read."
                    isDark={
                      isDark
                    }
                  />

                  <div
                    className={`mb-5 rounded-xl border p-4 ${
                      isDark
                        ? "border-blue-500/20 bg-blue-500/10"
                        : "border-blue-100 bg-blue-50/60"
                    }`}
                  >
                    <p
                      className={`text-sm font-black ${
                        isDark
                          ? "text-slate-100"
                          : "text-slate-900"
                      }`}
                    >
                      What should you
                      include?
                    </p>

                    <div
                      className={`mt-3 grid gap-x-6 gap-y-2 text-xs leading-5 sm:grid-cols-2 sm:text-sm ${
                        isDark
                          ? "text-slate-400"
                          : "text-slate-600"
                      }`}
                    >
                      {[
                        "Interview rounds",
                        "Questions asked",
                        "DSA / LLD / HLD topics",
                        "Backend / AI / GenAI topics",
                        "Follow-up questions",
                        "Difficulty",
                        "Preparation strategy",
                        "Advice for engineers",
                      ].map(
                        (item) => (
                          <span
                            key={
                              item
                            }
                            className="flex items-start gap-2"
                          >
                            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-500" />
                            {item}
                          </span>
                        )
                      )}
                    </div>
                  </div>

                  <MarkdownEditor
                    value={
                      form.content
                    }
                    onChange={
                      handleContentChange
                    }
                    error={
                      errors.content
                    }
                    isDark={
                      isDark
                    }
                  />
                </section>

                <section
                  className={`rounded-2xl border p-4 sm:p-5 ${
                    isDark
                      ? "border-slate-800 bg-slate-900/70"
                      : "border-slate-200 bg-slate-100/70"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-500" />

                    <div className="space-y-2">
                      <h2
                        className={`text-sm font-black ${
                          isDark
                            ? "text-slate-100"
                            : "text-slate-900"
                        }`}
                      >
                        Before you
                        submit
                      </h2>

                      <p
                        className={`text-xs leading-6 sm:text-sm ${
                          isDark
                            ? "text-slate-400"
                            : "text-slate-600"
                        }`}
                      >
                        Every
                        submission is
                        reviewed before
                        it becomes
                        public.
                        TargetTrek may
                        improve
                        formatting and
                        grammar, and
                        may remove
                        spam,
                        promotional
                        links, personal
                        information or
                        confidential
                        information
                        before
                        publishing.
                      </p>

                      <p
                        className={`text-xs leading-6 sm:text-sm ${
                          isDark
                            ? "text-slate-400"
                            : "text-slate-600"
                        }`}
                      >
                        Your email and
                        mobile number
                        are used only
                        for moderation
                        or communication
                        related to your
                        submission and
                        are never
                        displayed
                        publicly.
                      </p>
                    </div>
                  </div>
                </section>

                {errors.submit && (
                  <div
                    role="alert"
                    className={`rounded-xl border px-4 py-3 ${
                      isDark
                        ? "border-red-500/30 bg-red-500/10"
                        : "border-red-200 bg-red-50"
                    }`}
                  >
                    <p
                      className={`text-sm font-semibold ${
                        isDark
                          ? "text-red-400"
                          : "text-red-700"
                      }`}
                    >
                      {
                        errors.submit
                      }
                    </p>
                  </div>
                )}

                <div
                  className={`rounded-2xl border p-4 sm:flex sm:items-center sm:justify-between sm:gap-6 sm:p-5 ${
                    isDark
                      ? "border-slate-800 bg-slate-900"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="mb-4 sm:mb-0">
                    <p
                      className={`text-sm font-bold ${
                        isDark
                          ? "text-slate-200"
                          : "text-slate-800"
                      }`}
                    >
                      Ready to share
                      your experience?
                    </p>

                    <p
                      className={`mt-1 max-w-lg text-xs leading-5 ${
                        isDark
                          ? "text-slate-500"
                          : "text-slate-500"
                      }`}
                    >
                      Maximum 3
                      interview
                      submissions are
                      allowed within a
                      rolling 6-hour
                      period.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={
                      submitting
                    }
                    className="inline-flex min-h-[50px] w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                  >
                    {submitting ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Submit
                        Interview
                      </>
                    )}
                  </button>
                </div>
              </form>

              <aside className="min-w-0 space-y-4 lg:sticky lg:top-24 lg:self-start">
                <section
                  className={`rounded-2xl border p-5 shadow-sm ${
                    isDark
                      ? "border-slate-800 bg-slate-900"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-blue-500" />

                    <h2
                      className={`text-sm font-black ${
                        isDark
                          ? "text-white"
                          : "text-slate-950"
                      }`}
                    >
                      Writing tips
                    </h2>
                  </div>

                  <div
                    className={`mt-4 space-y-3 text-xs leading-5 ${
                      isDark
                        ? "text-slate-400"
                        : "text-slate-600"
                    }`}
                  >
                    <p>
                      <strong
                        className={
                          isDark
                            ? "text-slate-200"
                            : "text-slate-800"
                        }
                      >
                        Be specific.
                      </strong>{" "}
                      Mention the
                      actual rounds,
                      topics and
                      follow-up
                      questions.
                    </p>

                    <p>
                      <strong
                        className={
                          isDark
                            ? "text-slate-200"
                            : "text-slate-800"
                        }
                      >
                        Add context.
                      </strong>{" "}
                      Explain your
                      approach instead
                      of only listing
                      question names.
                    </p>

                    <p>
                      <strong
                        className={
                          isDark
                            ? "text-slate-200"
                            : "text-slate-800"
                        }
                      >
                        Structure it.
                      </strong>{" "}
                      Use headings for
                      OA, DSA, LLD,
                      HLD, managerial
                      and HR rounds.
                    </p>
                  </div>
                </section>

                <section
                  className={`rounded-2xl border p-5 shadow-sm ${
                    isDark
                      ? "border-emerald-500/20 bg-emerald-500/5"
                      : "border-emerald-100 bg-emerald-50/70"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck
                      className={`h-4 w-4 ${
                        isDark
                          ? "text-emerald-400"
                          : "text-emerald-600"
                      }`}
                    />

                    <h2
                      className={`text-sm font-black ${
                        isDark
                          ? "text-emerald-300"
                          : "text-emerald-900"
                      }`}
                    >
                      Your privacy
                    </h2>
                  </div>

                  <p
                    className={`mt-3 text-xs leading-6 ${
                      isDark
                        ? "text-emerald-200/70"
                        : "text-emerald-800"
                    }`}
                  >
                    Your email and
                    phone number are
                    collected for
                    moderation and
                    communication.
                    They are not
                    shown on the
                    published
                    interview
                    experience.
                  </p>
                </section>

                <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-5 text-white shadow-lg shadow-blue-600/10">
                  <BriefcaseBusiness className="h-6 w-6" />

                  <h2 className="mt-4 text-lg font-black">
                    Explore real
                    interview
                    experiences
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-blue-100">
                    Read experiences
                    shared by other
                    engineers across
                    software,
                    backend, system
                    design and AI
                    roles.
                  </p>

                  <Link
                    to="/interviews"
                    className="mt-4 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-black text-blue-700 transition hover:bg-blue-50"
                  >
                    Browse Interviews
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </section>
              </aside>
            </div>
          </main>
        </div>
      </>
    );
  };

export default AddInterviewExperience;