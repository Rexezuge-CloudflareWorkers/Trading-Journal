type D1Queryable = Pick<D1Database, 'prepare' | 'batch'>;

type D1SessionEnv<TEnv extends { DB: D1Database }> = Omit<TEnv, 'DB'> & {
  DB: D1DatabaseSession;
};

function createD1SessionEnv<TEnv extends { DB: D1Database }>(env: TEnv): D1SessionEnv<TEnv> {
  if (typeof env.DB.withSession !== 'function') {
    return env as unknown as D1SessionEnv<TEnv>;
  }
  return {
    ...env,
    DB: env.DB.withSession('first-primary'),
  };
}

export { createD1SessionEnv };
export type { D1Queryable, D1SessionEnv };
