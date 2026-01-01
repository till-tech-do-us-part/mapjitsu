Using the Extension in a Native Windows Environment (Full Support)

To unlock all the capabilities above, you currently need to run Claude Code in a supported environment – on Windows or another OS outside of WSL. In a native Windows setup, the Chrome extension works as intended and provides full browser automation functionality. Typically, you would:

Run Claude Code on Windows (either via the CLI in PowerShell/Command Prompt or using the Claude Code VS Code extension in a Windows VS Code session). Start it with the Chrome integration enabled (for example, by launching claude --chrome in the terminal)
reddit.com
. This will have Claude Code attempt to connect to the Chrome extension. You should see confirmation inside Claude Code that “Chrome integration: Enabled” if the connection is successful
reddit.com
.

Have Google Chrome (with the Claude extension) running on Windows. The extension must be installed and you should be logged in to your Claude account through it
reddit.com
reddit.com
. Once connected, Claude Code will open new Chrome tabs as needed to carry out your commands. Chrome should remain open (not minimized to tray) because a visible window is required for the integration’s operation
code.claude.com
.

Execute browser tasks through natural language prompts in the Claude Code interface. In the Windows environment, every feature described (navigation, clicking, typing, reading content, etc.) is available. For example, you can directly ask Claude in the CLI session to perform a series of actions on a website and it will do so in your Windows Chrome. The process is seamless – as you issue instructions, you’ll see Chrome acting on them in real time, and Claude will report back results (text it found, console messages, success/failure of interactions, etc.) in the terminal. The integration truly allows you to “build in your terminal, then test and debug in your browser without switching contexts”
code.claude.com
. This unified workflow is fully realized when running on Windows.

Leverage existing logins and context: In Windows Chrome, any site you’re already authenticated to can be accessed by Claude. The extension shares the browser’s cookies and session state
code.claude.com
. This means, for instance, Claude can compose an email in your Gmail or add entries to your private Notion workspace if your Chrome is logged in to those services. No additional setup is needed beyond being logged in normally. Claude simply uses the same session like a human user would – one of the major advantages of this extension approach. (Of course, be mindful that Claude will have whatever level of access you grant through these actions.)

Performance and guardrails: In the Windows environment, Claude’s browser control works, but it’s intentionally guardrailed for safety. By default the Claude in Chrome extension is in “Ask before acting” mode, meaning you may need to approve each action in the Chrome side panel for security
reddit.com
. (This prevents unwanted clicks or navigation to malicious sites without your knowledge.) You can adjust this setting, but it’s there to ensure you remain in control. Additionally, the extension won’t perform certain prohibited actions – for example, it’s not going to hack around paywalls or engage in extensive web scraping that violates terms
reddit.com
. The focus is on user-directed, reasonable browsing tasks. Autonomous testing and routine interactions are fine, but anything sensitive or financially impactful is discouraged. (Anthropic explicitly warns not to use it for things like financial transactions or other high-stakes actions without supervision
reddit.com
.)

Limitations in Windows: Aside from the guardrails, note that it currently only works with Google Chrome (Beta) – other Chromium browsers like Brave, Arc, or Edge are not officially supported in this mode (though some users have reported it working in Edge)
code.claude.com
reddit.com
. You should also keep Chrome as your default or explicitly launch Chrome, since the CLI might try to open the default browser (one user noted it opened Firefox by mistake when Chrome wasn’t default)
reddit.com
. In practice, using Chrome as directed avoids that issue. Also, expect higher token usage: letting an AI agent navigate pages and describe them can consume a lot of tokens from your Claude plan
reddit.com
, so complex multi-page workflows may count against your usage limits more than normal Q&A coding. Overall though, on native Windows the extension integration is robust and all the advertised capabilities are available – from local site testing to multi-tab workflows – making it possible to build and test your app in a very autonomous fashion.