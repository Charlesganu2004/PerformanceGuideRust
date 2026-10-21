# Performance Guide Rust (PGR)

A desktop command-line tool for AI coding agents. The agent asks where something is
defined, what calls it and what a change reaches, and gets the answer in one step,
from an index of the repository it works in. It runs on your own machine, with no
account, no server and no network use, and works with any agent that can run a
command, including Claude Code and the Codex CLI.

- **Results and how they were measured:** https://charlesganu2004.github.io/PerformanceGuideRust/
- **Downloads:** [Releases](https://github.com/Charlesganu2004/PerformanceGuideRust/releases/latest)
  for Windows, macOS (Apple silicon and Intel) and Linux (x86-64 and ARM)

## Install

Windows (PowerShell, no administrator rights):

```powershell
irm https://github.com/Charlesganu2004/PerformanceGuideRust/releases/latest/download/install.ps1 | iex
```

macOS and Linux:

```sh
curl -fsSL https://github.com/Charlesganu2004/PerformanceGuideRust/releases/latest/download/install.sh | sh
```

Each installer downloads one program file, checks it against the published
`SHA256SUMS.txt` and puts it in a folder of your user account. Nothing else is
installed.

## First use

```sh
cd your-repository
pgr refresh
pgr ask about:SomeFunction "find:where tokens expire"
pgr help
```

## Licence

Proprietary. Free to download and use; not open source. See [LICENSE.txt](LICENSE.txt).
This repository holds the released programs, the installers and the results site.
The source code is not published.
