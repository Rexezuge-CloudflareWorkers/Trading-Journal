import { UserDAO } from '@trading-journal/backend-data/dao';
import type { User } from '@trading-journal/shared/model';

interface UserServiceEnv {
  DB: D1Database;
}

class UserService {
  private readonly userDAO: UserDAO;
  private readonly userId: string;

  constructor(env: UserServiceEnv, userId: string) {
    this.userDAO = new UserDAO(env.DB);
    this.userId = userId;
  }

  public getUserId(): string {
    return this.userId;
  }

  public async getCurrentUser(): Promise<User | null> {
    return this.userDAO.getUser(this.userId);
  }

  public static deriveUserId(email: string): string {
    let hash = 2166136261;
    for (let i = 0; i < email.length; i++) {
      hash ^= email.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return `user-${(hash >>> 0).toString(16).padStart(8, '0')}`;
  }

  public static async resolveUser(env: UserServiceEnv, email: string): Promise<string> {
    const userId: string = UserService.deriveUserId(email);
    const userDAO: UserDAO = new UserDAO(env.DB);
    await userDAO.upsertUser(userId, email);
    return userId;
  }
}

export { UserService };
export type { UserServiceEnv };
