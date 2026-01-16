
export const RoleEnum = {
    Admin: 'ADMIN',
    Tech: 'TECH',
    Fin: 'FIN',
    Client: 'CLIENT'
} as const;


export type RoleEnum = typeof RoleEnum[keyof typeof RoleEnum];

