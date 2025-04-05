import { StagehandSession } from '../';
import fs from 'fs';
import path from 'path';
import os from 'os';

jest.mock('@browserbasehq/stagehand');
jest.mock('fs');
jest.mock('path');
jest.mock('os');

describe('StagehandSession', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (os.homedir as jest.Mock).mockReturnValue('/home/user');
    (path.join as jest.Mock).mockImplementation((...args) => args.join('/'));
    (fs.existsSync as jest.Mock).mockReturnValue(false);
  });

  it('should create with default config', () => {
    const session = new StagehandSession({
      verbose: 1,
      env: 'LOCAL'
    });

    expect(session).toBeDefined();
    expect(path.join).toHaveBeenCalledWith('/home/user', '.stagehand-sessions');
  });

  it('should create with custom config', () => {
    const session = new StagehandSession({
      verbose: 1,
      env: 'LOCAL'
    }, {
      sessionName: 'test-session',
      storageDir: '/custom/path'
    });

    expect(session).toBeDefined();
    expect(path.join).toHaveBeenCalledWith('/custom/path', 'test-session.json');
  });

  it('should create storage directory on init if it does not exist', async () => {
    const session = new StagehandSession({
      verbose: 1,
      env: 'LOCAL'
    });

    await session.init();

    expect(fs.mkdirSync).toHaveBeenCalledWith('/home/user/.stagehand-sessions', { recursive: true });
  });

  it('should not create storage directory on init if it exists', async () => {
    (fs.existsSync as jest.Mock).mockReturnValue(true);

    const session = new StagehandSession({
      verbose: 1,
      env: 'LOCAL'
    });

    await session.init();

    expect(fs.mkdirSync).not.toHaveBeenCalled();
  });
}); 