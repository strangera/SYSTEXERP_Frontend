import { GroupMemberInfo } from './groupMemberInfo'
import { UserAuthInfo } from './userAuthInfo';
export interface UserForm {
  user_no?: string;
  user_cname?: string;
  user_ename?: string;
  user_password?: string;
  user_status?: string;
  user_str_date?: Date;
  user_end_date?: Date;
  user_lock?: string;
  user_pause?: string;
  user_auth_pswd?: string;
  user_email?: string;
  sto_no?: string;
  bonus_limit?: number;
  card_limit?: number;
  issue_card_date?: Date;
  groupmember_info?: GroupMemberInfo[];
  userauth_info?: UserAuthInfo[];
}
