import type { D1Queryable } from '../utils';

abstract class BaseDAO {
  constructor(protected readonly database: D1Queryable) {}

  public getDatabase(): D1Queryable {
    return this.database;
  }
}

export { BaseDAO };
