/**
 * @public
 */
export interface IOrganization {
  orgId: string;
  bpid: string;
  orgName: string;
  roles: Array<string>;
  status: string;
}

/**
 * @public
 */
export interface IGroups {
  organizations: Array<IOrganization> | undefined;
}
