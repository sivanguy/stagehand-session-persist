# @browserbasehq/stagehand-session

Session management plugin for Stagehand - persist cookies and state between browser runs.

## Features

- 🔄 Automatic cookie persistence between browser sessions
- 📁 Configurable storage location
- 🏷️ Support for multiple named sessions
- 🤖 Seamless integration with Stagehand

## Installation

```bash
npm install @browserbasehq/stagehand-session
```

## Usage

```typescript
import { StagehandSession } from '@browserbasehq/stagehand-session';

// Create a session-enabled Stagehand instance
const session = new StagehandSession({
  // Your usual Stagehand config
  verbose: 1,
  env: "LOCAL",
  localBrowserLaunchOptions: {
    headless: false
  }
}, {
  // Optional session config
  sessionName: 'gmail', // Name your session
  storageDir: '~/.my-sessions', // Custom storage location
  autoSave: true, // Auto-save on close
  autoLoad: true // Auto-load on start
});

// Initialize (this will also load any existing session)
await session.init();

// Use it just like regular Stagehand
await session.page.goto('https://gmail.com');

// Session will be automatically saved on close
await session.close();
```

## Configuration

The `StagehandSession` constructor accepts two arguments:

1. Standard Stagehand configuration
2. Session configuration (optional):

```typescript
interface SessionConfig {
  // Directory to store session data (default: ~/.stagehand-sessions)
  storageDir?: string;
  
  // Name of the session (default: 'default')
  sessionName?: string;
  
  // Auto-save session on close (default: true)
  autoSave?: boolean;
  
  // Auto-load session on start (default: true)
  autoLoad?: boolean;
}
```

## Manual Session Control

While sessions are managed automatically by default, you can also control them manually:

```typescript
// Manually save the current session
await session.saveSession();

// Manually load a saved session
await session.loadSession();
```

## Example: Maintaining Gmail Login

```typescript
import { StagehandSession } from '@browserbasehq/stagehand-session';

async function main() {
  const session = new StagehandSession({
    verbose: 1,
    env: "LOCAL",
    localBrowserLaunchOptions: {
      headless: false
    }
  }, {
    sessionName: 'gmail'
  });

  await session.init();
  
  await session.page.goto('https://mail.google.com');
  
  // Check if we're already logged in
  const isLoggedIn = await session.page.evaluate(() => {
    return document.querySelector('div[role="button"][gh="cm"]') !== null;
  });

  if (!isLoggedIn) {
    console.log('Please log in manually...');
    // Wait for the compose button to appear (indicating successful login)
    await session.page.waitForSelector('div[role="button"][gh="cm"]', { 
      timeout: 300000 // 5 minutes timeout for manual login
    });
    console.log('Successfully logged in!');
  } else {
    console.log('Already logged in!');
  }

  // Session will be saved automatically on close
  await session.close();
}

main();
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. 