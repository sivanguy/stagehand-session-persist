import { Stagehand } from "@browserbasehq/stagehand";
import path from "path";
import fs from "fs";
import os from "os";

export interface SessionConfig {
  /**
   * Directory to store session data
   * @default ~/.stagehand-sessions
   */
  storageDir?: string;
  
  /**
   * Name of the session (used for the storage file name)
   * @default 'default'
   */
  sessionName?: string;
  
  /**
   * Whether to automatically save session on close
   * @default true
   */
  autoSave?: boolean;
  
  /**
   * Whether to automatically load session on init
   * @default true
   */
  autoLoad?: boolean;
}

export class StagehandSession {
  private stagehand: Stagehand;
  private storageDir: string;
  private storageFile: string;
  private config: Required<SessionConfig>;

  constructor(stagehandConfig: ConstructorParameters<typeof Stagehand>[0], sessionConfig: SessionConfig = {}) {
    this.config = {
      storageDir: path.join(os.homedir(), '.stagehand-sessions'),
      sessionName: 'default',
      autoSave: true,
      autoLoad: true,
      ...sessionConfig
    };

    this.storageDir = this.config.storageDir;
    this.storageFile = path.join(this.storageDir, `${this.config.sessionName}.json`);
    this.stagehand = new Stagehand(stagehandConfig);
  }

  /**
   * Initialize Stagehand with session support
   */
  async init(): Promise<void> {
    // Create storage directory if it doesn't exist
    if (!fs.existsSync(this.storageDir)) {
      fs.mkdirSync(this.storageDir, { recursive: true });
    }

    await this.stagehand.init();

    if (this.config.autoLoad) {
      await this.loadSession();
    }
  }

  /**
   * Load session data (cookies) from storage
   */
  async loadSession(): Promise<void> {
    if (fs.existsSync(this.storageFile)) {
      const state = JSON.parse(fs.readFileSync(this.storageFile, 'utf8'));
      if (state.cookies) {
        await this.stagehand.context.addCookies(state.cookies);
      }
    }
  }

  /**
   * Save current session data (cookies) to storage
   */
  async saveSession(): Promise<void> {
    const cookies = await this.stagehand.context.cookies();
    fs.writeFileSync(this.storageFile, JSON.stringify({ cookies }, null, 2));
  }

  /**
   * Close the browser and optionally save the session
   */
  async close(): Promise<void> {
    if (this.config.autoSave) {
      await this.saveSession();
    }
    await this.stagehand.close();
  }

  /**
   * Get the Stagehand page instance
   */
  get page() {
    return this.stagehand.page;
  }

  /**
   * Get the Stagehand context instance
   */
  get context() {
    return this.stagehand.context;
  }
} 