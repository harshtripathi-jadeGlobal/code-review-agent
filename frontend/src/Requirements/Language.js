// ─────────────────────────────────────────────────────────────
// languageProfiles.js
// Central config for all supported languages.
// Each profile contains:
//   name       — language identifier (used in API, editor, badges)
//   extension  — file extension to auto-assign on detection
//   editorLang — language id passed to CodeEditor (Monaco/CodeMirror)
//   badgeClass — Tailwind classes for the language badge pill
//   signals    — regex patterns used for auto-detection scoring
// ─────────────────────────────────────────────────────────────

export const LANGUAGE_PROFILES = [
  {
    name: 'python',
    extension: '.py',
    editorLang: 'python',
    badgeClass: 'bg-blue-900/50 text-blue-300',
    signals: [
      /^\s*def\s+\w+\s*\(/m,           // def function():
      /^\s*class\s+\w+.*:/m,            // class Foo:
      /^\s*(import|from)\s+\w+/m,       // import / from x import
      /^\s*elif\s+/m,                   // elif keyword
      /^\s*except(\s+\w+)?:/m,          // except:
      /f["'][^"']*{/,                   // f-strings
      /print\s*\(/,                     // print(
      /self\.\w+/,                      // self.x
      /:\s*\n\s{4}/m,                   // colon + 4-space indent
      /lambda\s+\w+/,                   // lambda keyword
    ],
  },
  {
    name: 'javascript',
    extension: '.js',
    editorLang: 'javascript',
    badgeClass: 'bg-yellow-900/50 text-yellow-300',
   signals: [
  /^\s*(const|let|var)\s+\w+\s*=/m,
  /=>/,
  /^\s*function\s+\w+\s*\(/m,
  /console\.(log|error|warn)\s*\(/,
  /===|!==/,
  /document\.|window\.|querySelector/,
  /\.then\s*\(|\.catch\s*\(/,
  /require\s*\(\s*['"]/,
  /\bundefined\b|\bnull\b/,
  /for\s*\(|while\s*\(/,        // ✅ NEW
  /if\s*\(/,                   // ✅ NEW
],
  },
  {
    name: 'typescript',
    extension: '.ts',
    editorLang: 'typescript',
    badgeClass: 'bg-sky-900/50 text-sky-300',
    signals: [
      /:\s*(string|number|boolean|void|any|never|unknown)\b/, // type annotations
      /interface\s+\w+\s*{/,              // interface Foo {
      /type\s+\w+\s*=/,                   // type Foo =
      /<[A-Z]\w*>/,                        // generics <T>
      /as\s+(string|number|boolean|\w+)/, // type casting
      /readonly\s+\w+/,                   // readonly keyword
      /enum\s+\w+\s*{/,                   // enum
      /^\s*import\s+.*from\s+['"]/m,      // import x from 'y'
      /:\s*\w+\[\]/,                       // typed arrays
      /Partial<|Required<|Pick<|Omit</,   // utility types
    ],
  },
  {
    name: 'tsx',
    extension: '.tsx',
    editorLang: 'typescript',
    badgeClass: 'bg-cyan-900/50 text-cyan-300',
    signals: [
      /import\s+React/,                   // import React
      /useState|useEffect|useRef/,        // React hooks
      /return\s*\(\s*</,                  // return JSX
      /<[A-Z]\w+\s/,                      // <Component
      /className=/,                        // JSX className
      /onClick=|onChange=|onSubmit=/,     // JSX events
      /props\.\w+|{\.\.\.props}/,         // props usage
      /ReactNode|JSX\.Element/,           // React types
    ],
  },
  {
    name: 'jsx',
    extension: '.jsx',
    editorLang: 'javascript',
    badgeClass: 'bg-cyan-900/50 text-cyan-300',
    signals: [
      /import\s+React/,                   // import React
      /useState|useEffect|useRef/,        // React hooks
      /return\s*\(\s*</,                  // return JSX
      /<[A-Z]\w+[\s/>]/,                  // <Component
      /className=/,                        // JSX className
      /onClick=|onChange=/,               // JSX events
      /export\s+default\s+function/,      // export default function
    ],
  },
  {
    name: 'java',
    extension: '.java',
    editorLang: 'java',
    badgeClass: 'bg-orange-900/50 text-orange-300',
    signals: [
      /^\s*public\s+(class|interface|enum)\s+\w+/m, // public class Foo
      /^\s*(public|private|protected)\s+\w+\s+\w+\s*\(/m, // method declarations
      /System\.out\.print(ln)?\s*\(/,     // System.out.println
      /^\s*import\s+java\./m,             // import java.
      /new\s+\w+\s*\(/,                   // new Foo()
      /@Override|@Autowired|@Component/,  // annotations
      /\bvoid\b|\bstatic\b|\bfinal\b/,    // Java keywords
      /throws\s+\w+Exception/,            // throws Exception
    ],
  },
  {
    name: 'c',
    extension: '.c',
    editorLang: 'c',
    badgeClass: 'bg-slate-700/50 text-slate-300',
    signals: [
      /^\s*#include\s*[<"]/m,             // #include <stdio.h>
      /^\s*#define\s+\w+/m,               // #define MACRO
      /printf\s*\(|scanf\s*\(/,           // printf / scanf
      /int\s+main\s*\(\s*(void|int)/,     // int main(void)
      /malloc\s*\(|free\s*\(/,            // malloc / free
      /\*\w+\s*=|\w+\s*\*\s*\w+/,        // pointers
      /struct\s+\w+\s*{/,                 // struct
      /sizeof\s*\(/,                       // sizeof
    ],
  },
  {
    name: 'cpp',
    extension: '.cpp',
    editorLang: 'cpp',
    badgeClass: 'bg-indigo-900/50 text-indigo-300',
    signals: [
      /^\s*#include\s*<(iostream|vector|string|map)/m, // C++ headers
      /std::(cout|cin|endl|vector|string|map)/,        // std::
      /^\s*using\s+namespace\s+std/m,     // using namespace std
      /class\s+\w+\s*{/,                  // class Foo {
      /cout\s*<<|cin\s*>>/,               // stream operators
      /\bnew\b.*\bdelete\b|\bdelete\b/,   // new/delete
      /template\s*<\s*(typename|class)/,  // templates
      /::\w+/,                             // scope resolution
    ],
  },
  {
    name: 'rust',
    extension: '.rs',
    editorLang: 'rust',
    badgeClass: 'bg-orange-900/50 text-orange-400',
    signals: [
      /^\s*fn\s+\w+\s*\(/m,               // fn function()
      /let\s+(mut\s+)?\w+\s*=/,           // let / let mut
      /^\s*use\s+\w+::/m,                 // use std::
      /println!\s*\(/,                    // println! macro
      /impl\s+\w+/,                       // impl Trait
      /->\s*\w+(\s*{|$)/m,               // return type ->
      /::\s*new\s*\(/,                    // ::new()
      /match\s+\w+\s*{/,                 // match expression
      /Some\(|None\b|Ok\(|Err\(/,         // Option/Result types
    ],
  },
  {
    name: 'go',
    extension: '.go',
    editorLang: 'go',
    badgeClass: 'bg-teal-900/50 text-teal-300',
    signals: [
      /^\s*package\s+\w+/m,               // package main
      /^\s*import\s+\(/m,                 // import (
      /^\s*func\s+\w+\s*\(/m,             // func foo()
      /fmt\.(Println|Printf|Sprintf)/,    // fmt.Println
      /:=\s*/,                             // short variable :=
      /^\s*type\s+\w+\s+struct\s*{/m,    // type Foo struct
      /\bgoroutine\b|\bchan\b/,           // goroutine / chan
      /\bdefer\b/,                         // defer keyword
      /go\s+\w+\s*\(/,                    // go func()
    ],
  },
  {
    name: 'ruby',
    extension: '.rb',
    editorLang: 'ruby',
    badgeClass: 'bg-red-900/50 text-red-300',
    signals: [
      /^\s*def\s+\w+/m,                   // def method
      /^\s*class\s+\w+(\s*<\s*\w+)?$/m,  // class Foo < Bar
      /puts\s+|print\s+/,                 // puts / print
      /^\s*require\s+['"]/m,              // require 'gem'
      /\bend\b/,                           // end keyword
      /\bdo\s*\|.*\|/,                    // do |block|
      /@\w+\s*=/,                          // instance variable @foo
      /\.each\s*{|\.map\s*{/,            // .each { }
      /\bnil\b|\btrue\b|\bfalse\b/,       // Ruby primitives
    ],
  },
  {
    name: 'php',
    extension: '.php',
    editorLang: 'php',
    badgeClass: 'bg-violet-900/50 text-violet-300',
    signals: [
      /<\?php/,                            // <?php tag
      /\$\w+\s*=/,                         // $variable =
      /echo\s+/,                           // echo
      /^\s*function\s+\w+\s*\(/m,         // function foo()
      /\->\w+\s*\(/,                       // ->method()
      /::\w+\s*\(/,                        // ::method()
      /array\s*\(|\[\s*['"]/,             // arrays
      /\bnull\b|\btrue\b|\bfalse\b/,      // PHP primitives
    ],
  },
  {
    name: 'swift',
    extension: '.swift',
    editorLang: 'swift',
    badgeClass: 'bg-orange-900/50 text-orange-300',
    signals: [
      /^\s*func\s+\w+\s*\(/m,             // func foo()
      /^\s*(let|var)\s+\w+\s*:/m,         // let x: Type
      /print\s*\(/,                        // print(
      /import\s+(Foundation|UIKit|SwiftUI)/, // Swift frameworks
      /guard\s+let\b/,                     // guard let
      /if\s+let\b/,                        // if let
      /\?\.|!\./,                           // optional chaining
      /struct\s+\w+.*{/,                  // struct
      /@State\s+|@Binding\s+|@Published/, // SwiftUI property wrappers
    ],
  },
  {
    name: 'kotlin',
    extension: '.kt',
    editorLang: 'kotlin',
    badgeClass: 'bg-purple-900/50 text-purple-300',
    signals: [
      /^\s*fun\s+\w+\s*\(/m,              // fun foo()
      /^\s*val\s+\w+\s*=/m,               // val x =
      /^\s*var\s+\w+\s*:/m,               // var x:
      /println\s*\(/,                      // println
      /data\s+class\s+\w+/,               // data class
      /object\s+\w+\s*{/,                // object declaration
      /when\s*\(.*\)\s*{/,               // when expression
      /\?\s*:\s*/,                         // Elvis operator ?:
      /import\s+kotlin\./,                // kotlin imports
    ],
  },
  {
    name: 'sql',
    extension: '.sql',
    editorLang: 'sql',
    badgeClass: 'bg-lime-900/50 text-lime-300',
    signals: [
      /^\s*(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER)\b/im, // SQL keywords
      /\bFROM\s+\w+/i,                    // FROM table
      /\bWHERE\s+\w+/i,                   // WHERE clause
      /\bJOIN\s+\w+/i,                    // JOIN
      /\bGROUP\s+BY\b/i,                  // GROUP BY
      /\bORDER\s+BY\b/i,                  // ORDER BY
      /\bINNER\s+JOIN\b|\bLEFT\s+JOIN\b/i, // JOIN types
    ],
  },
  {
    name: 'css',
    extension: '.css',
    editorLang: 'css',
    badgeClass: 'bg-pink-900/50 text-pink-300',
    signals: [
      /[.#]?\w+\s*{[^}]*}/,               // selector { ... }
      /:\s*(flex|grid|block|inline)/,     // display values
      /\bmargin\b|\bpadding\b|\bborder\b/, // box model
      /@media\s*\(/,                       // media queries
      /rgba?\s*\(|#[0-9a-fA-F]{3,6}/,    // colors
      /px|em|rem|vh|vw/,                   // CSS units
      /font-(size|weight|family)/,         // font properties
    ],
  },
  {
    name: 'html',
    extension: '.html',
    editorLang: 'html',
    badgeClass: 'bg-rose-900/50 text-rose-300',
    signals: [
      /<!DOCTYPE\s+html>/i,               // doctype
      /<html[\s>]/i,                       // <html>
      /<(div|span|p|h[1-6]|section|article)\b/, // common tags
      /<(head|body|header|footer|nav)\b/, // structural tags
      /class=["']/,                        // class attribute
      /href=["']|src=["']/,               // href/src attributes
      /<\/\w+>/,                           // closing tags
    ],
  },
  {
    name: 'bash',
    extension: '.sh',
    editorLang: 'shell',
    badgeClass: 'bg-gray-700/50 text-gray-300',
    signals: [
      /^#!\s*\/bin\/(bash|sh|zsh)/m,      // shebang line
      /^\s*echo\s+/m,                      // echo command
      /\$\{?\w+\}?/,                       // $VARIABLE
      /^\s*if\s+\[.*\];?\s*then/m,        // if [ ]; then
      /^\s*for\s+\w+\s+in\s+/m,           // for x in
      /\|\s*grep\b|\|\s*awk\b/,           // pipes with grep/awk
      /chmod|chown|mkdir|rm\s+-/,         // common shell commands
      /\$\(\s*\w+/,                        // command substitution $()
    ],
  },
]

// ─────────────────────────────────────────────────────────────
// detectLanguage(code)
// Scores each language profile against the given code,
// returns the best-matching profile object or null.
// Requires at least 2 signal matches to avoid false positives.
// ─────────────────────────────────────────────────────────────
export function detectLanguage(code) {
  if (!code || !code.trim()) return null

  let bestMatch = null
  let bestScore = 1 // minimum threshold (must beat 1 to qualify)

  for (const lang of LANGUAGE_PROFILES) {
    const score = lang.signals.filter(regex => regex.test(code)).length
    if (score > bestScore) {
      bestScore = score
      bestMatch = lang
    }
  }

  return bestMatch // full profile object { name, extension, editorLang, badgeClass, signals }
}

// ─────────────────────────────────────────────────────────────
// syncFilenameExtension(filename, extension)
// Replaces current file extension with the detected one.
// e.g. ("main.py", ".js") → "main.js"
// ─────────────────────────────────────────────────────────────
export function syncFilenameExtension(currentFilename, extension) {
  const base = currentFilename.replace(/\.\w+$/, '')
  return `${base}${extension}`
}