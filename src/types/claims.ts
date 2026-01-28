export interface Claim {
  branch: {
    branchId: number;
    branchName: string;
    isInternal: boolean;
  };
  username: string;
  exp: number;        // Expiration timestamp (probably Unix time)
  iat: number;        // Issued-at timestamp (probably Unix time)
  roles: string[];    // Array of role strings
  sub: string;        // Subject identifier (e.g., username)
  userId: number;
}
