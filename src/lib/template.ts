// Seed template: compact single-file resume (Jake's Resume style, MIT-licensed original).
// Uses only standard TeXLive packages so SwiftLaTeX pdfTeX can fetch them on demand.
export const JAKES_TEMPLATE = String.raw`%------------------------ Resume ------------------------
% Jake's Resume style starter. Edit freely — preview recompiles as you type.
\documentclass[letterpaper,11pt]{article}

\usepackage[empty]{fullpage}
\usepackage{titlesec}
\usepackage[hidelinks]{hyperref}
\usepackage{fancyhdr}
\usepackage{enumitem}
\usepackage{tabularx}
\usepackage[usenames,dvipsnames]{color}

\pagestyle{fancy}
\fancyhf{}
\renewcommand{\headrulewidth}{0pt}
\renewcommand{\footrulewidth}{0pt}
\addtolength{\oddsidemargin}{-0.5in}
\addtolength{\evensidemargin}{-0.5in}
\addtolength{\textwidth}{1in}
\addtolength{\topmargin}{-.5in}
\addtolength{\textheight}{1.0in}
\urlstyle{same}
\raggedbottom
\raggedright
\setlength{\tabcolsep}{0in}

\titleformat{\section}{
  \vspace{-4pt}\scshape\raggedright\large
}{}{0em}{}[\color{black}\titlerule \vspace{-5pt}]

\newcommand{\resumeItem}[1]{\item\small{{#1 \vspace{-2pt}}}}
\newcommand{\resumeSubheading}[4]{
  \vspace{-2pt}\item
  \begin{tabular*}{0.97\textwidth}[t]{l@{\extracolsep{\fill}}r}
    \textbf{#1} & #2 \\
    \textit{\small#3} & \textit{\small #4} \\
  \end{tabular*}\vspace{-7pt}
}
\newcommand{\resumeSubHeadingListStart}{\begin{itemize}[leftmargin=0.15in, label={}]}
\newcommand{\resumeSubHeadingListEnd}{\end{itemize}}
\newcommand{\resumeItemListStart}{\begin{itemize}}
\newcommand{\resumeItemListEnd}{\end{itemize}\vspace{-5pt}}

\begin{document}

%---------- HEADING ----------
\begin{center}
  \textbf{\Huge \scshape Jane Doe} \\ \vspace{1pt}
  \small 123-456-7890 $|$ \href{mailto:jane@example.com}{jane@example.com} $|$
  \href{https://linkedin.com/in/janedoe}{linkedin.com/in/janedoe} $|$
  \href{https://github.com/janedoe}{github.com/janedoe}
\end{center}

%---------- EDUCATION ----------
\section{Education}
\resumeSubHeadingListStart
  \resumeSubheading
    {State University}{City, ST}
    {B.S. in Computer Science}{Aug 2021 -- May 2025}
\resumeSubHeadingListEnd

%---------- EXPERIENCE ----------
\section{Experience}
\resumeSubHeadingListStart
  \resumeSubheading
    {Software Engineer Intern}{May 2024 -- Aug 2024}
    {Example Corp}{City, ST}
    \resumeItemListStart
      \resumeItem{Built a feature used by 10k+ users, cutting load time by 30\%.}
      \resumeItem{Wrote tests covering 85\% of new code; fixed 20+ bugs.}
    \resumeItemListEnd
\resumeSubHeadingListEnd

%---------- PROJECTS ----------
\section{Projects}
\resumeSubHeadingListStart
  \resumeSubheading
    {Cool Project $|$ \emph{TypeScript, Next.js}}{2024}
    {}{}
    \resumeItemListStart
      \resumeItem{Shipped an open-source tool with 500+ GitHub stars.}
    \resumeItemListEnd
\resumeSubHeadingListEnd

%---------- SKILLS ----------
\section{Technical Skills}
\begin{itemize}[leftmargin=0.15in, label={}]
  \small{\item{
    \textbf{Languages}{: TypeScript, Python, Go} \\
    \textbf{Tools}{: Git, Docker, Postgres} \\
  }}
\end{itemize}

\end{document}
`;
