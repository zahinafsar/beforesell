import type { ExtractNextBody, ExtractNextQuery, ExtractNextResponse, ExtractNextParams } from 'next-ts-api';
import type { PUT as PUT_1, DELETE as DELETE_1 } from '../app/api/admin/categories/[id]/attributes/[attrId]/route';
import type { GET as GET_2, POST as POST_2 } from '../app/api/admin/categories/[id]/attributes/route';
import type { PUT as PUT_3, DELETE as DELETE_3 } from '../app/api/admin/categories/[id]/route';
import type { GET as GET_4, POST as POST_4 } from '../app/api/admin/categories/route';
import type { PUT as PUT_5, DELETE as DELETE_5 } from '../app/api/admin/listings/[id]/route';
import type { GET as GET_6 } from '../app/api/admin/listings/route';
import type { GET as GET_7 } from '../app/api/admin/stats/route';
import type { GET as GET_8, PUT as PUT_8 } from '../app/api/admin/users/[id]/route';
import type { GET as GET_9 } from '../app/api/admin/users/route';
import type { POST as POST_10 } from '../app/api/auth/forgot-password/route';
import type { POST as POST_11 } from '../app/api/auth/login/route';
import type { POST as POST_12 } from '../app/api/auth/logout/route';
import type { GET as GET_13 } from '../app/api/auth/me/route';
import type { POST as POST_14 } from '../app/api/auth/register/route';
import type { POST as POST_15 } from '../app/api/auth/reset-password/route';
import type { POST as POST_16 } from '../app/api/auth/verify-email/route';
import type { GET as GET_17 } from '../app/api/categories/[id]/attributes/route';
import type { POST as POST_18 } from '../app/api/conversations/[id]/messages/route';
import type { GET as GET_19 } from '../app/api/conversations/[id]/route';
import type { GET as GET_20, POST as POST_20 } from '../app/api/conversations/route';
import type { GET as GET_21 } from '../app/api/conversations/unread/route';
import type { POST as POST_22 } from '../app/api/listings/[id]/favorite/route';
import type { POST as POST_23, PUT as PUT_23, DELETE as DELETE_23 } from '../app/api/listings/[id]/images/route';
import type { GET as GET_24, PUT as PUT_24, DELETE as DELETE_24 } from '../app/api/listings/[id]/route';
import type { POST as POST_25, GET as GET_25 } from '../app/api/listings/route';
import type { GET as GET_26 } from '../app/api/user/favorites/route';
import type { GET as GET_27, PUT as PUT_27 } from '../app/api/user/profile/route';
import type { POST as POST_28 } from '../app/api/users/heartbeat/route';

export type ApiRoutes = {
  'admin/categories/[id]/attributes/[attrId]': {
    PUT: {
      body: ExtractNextBody<typeof PUT_1>
      response: ExtractNextResponse<typeof PUT_1>
      query: ExtractNextQuery<typeof PUT_1>
      params: ExtractNextParams<typeof PUT_1>
    },
    DELETE: {
      response: ExtractNextResponse<typeof DELETE_1>
      query: ExtractNextQuery<typeof DELETE_1>
      params: ExtractNextParams<typeof DELETE_1>
    },
  };
  'admin/categories/[id]/attributes': {
    GET: {
      response: ExtractNextResponse<typeof GET_2>
      query: ExtractNextQuery<typeof GET_2>
      params: ExtractNextParams<typeof GET_2>
    },
    POST: {
      body: ExtractNextBody<typeof POST_2>
      response: ExtractNextResponse<typeof POST_2>
      query: ExtractNextQuery<typeof POST_2>
      params: ExtractNextParams<typeof POST_2>
    },
  };
  'admin/categories/[id]': {
    PUT: {
      body: ExtractNextBody<typeof PUT_3>
      response: ExtractNextResponse<typeof PUT_3>
      query: ExtractNextQuery<typeof PUT_3>
      params: ExtractNextParams<typeof PUT_3>
    },
    DELETE: {
      response: ExtractNextResponse<typeof DELETE_3>
      query: ExtractNextQuery<typeof DELETE_3>
      params: ExtractNextParams<typeof DELETE_3>
    },
  };
  'admin/categories': {
    GET: {
      response: ExtractNextResponse<typeof GET_4>
      query: ExtractNextQuery<typeof GET_4>
      params: ExtractNextParams<typeof GET_4>
    },
    POST: {
      body: ExtractNextBody<typeof POST_4>
      response: ExtractNextResponse<typeof POST_4>
      query: ExtractNextQuery<typeof POST_4>
      params: ExtractNextParams<typeof POST_4>
    },
  };
  'admin/listings/[id]': {
    PUT: {
      body: ExtractNextBody<typeof PUT_5>
      response: ExtractNextResponse<typeof PUT_5>
      query: ExtractNextQuery<typeof PUT_5>
      params: ExtractNextParams<typeof PUT_5>
    },
    DELETE: {
      response: ExtractNextResponse<typeof DELETE_5>
      query: ExtractNextQuery<typeof DELETE_5>
      params: ExtractNextParams<typeof DELETE_5>
    },
  };
  'admin/listings': {
    GET: {
      response: ExtractNextResponse<typeof GET_6>
      query: ExtractNextQuery<typeof GET_6>
      params: ExtractNextParams<typeof GET_6>
    },
  };
  'admin/stats': {
    GET: {
      response: ExtractNextResponse<typeof GET_7>
      query: ExtractNextQuery<typeof GET_7>
      params: ExtractNextParams<typeof GET_7>
    },
  };
  'admin/users/[id]': {
    GET: {
      response: ExtractNextResponse<typeof GET_8>
      query: ExtractNextQuery<typeof GET_8>
      params: ExtractNextParams<typeof GET_8>
    },
    PUT: {
      body: ExtractNextBody<typeof PUT_8>
      response: ExtractNextResponse<typeof PUT_8>
      query: ExtractNextQuery<typeof PUT_8>
      params: ExtractNextParams<typeof PUT_8>
    },
  };
  'admin/users': {
    GET: {
      response: ExtractNextResponse<typeof GET_9>
      query: ExtractNextQuery<typeof GET_9>
      params: ExtractNextParams<typeof GET_9>
    },
  };
  'auth/forgot-password': {
    POST: {
      body: ExtractNextBody<typeof POST_10>
      response: ExtractNextResponse<typeof POST_10>
      query: ExtractNextQuery<typeof POST_10>
      params: ExtractNextParams<typeof POST_10>
    },
  };
  'auth/login': {
    POST: {
      body: ExtractNextBody<typeof POST_11>
      response: ExtractNextResponse<typeof POST_11>
      query: ExtractNextQuery<typeof POST_11>
      params: ExtractNextParams<typeof POST_11>
    },
  };
  'auth/logout': {
    POST: {
      body: ExtractNextBody<typeof POST_12>
      response: ExtractNextResponse<typeof POST_12>
      query: ExtractNextQuery<typeof POST_12>
      params: ExtractNextParams<typeof POST_12>
    },
  };
  'auth/me': {
    GET: {
      response: ExtractNextResponse<typeof GET_13>
      query: ExtractNextQuery<typeof GET_13>
      params: ExtractNextParams<typeof GET_13>
    },
  };
  'auth/register': {
    POST: {
      body: ExtractNextBody<typeof POST_14>
      response: ExtractNextResponse<typeof POST_14>
      query: ExtractNextQuery<typeof POST_14>
      params: ExtractNextParams<typeof POST_14>
    },
  };
  'auth/reset-password': {
    POST: {
      body: ExtractNextBody<typeof POST_15>
      response: ExtractNextResponse<typeof POST_15>
      query: ExtractNextQuery<typeof POST_15>
      params: ExtractNextParams<typeof POST_15>
    },
  };
  'auth/verify-email': {
    POST: {
      body: ExtractNextBody<typeof POST_16>
      response: ExtractNextResponse<typeof POST_16>
      query: ExtractNextQuery<typeof POST_16>
      params: ExtractNextParams<typeof POST_16>
    },
  };
  'categories/[id]/attributes': {
    GET: {
      response: ExtractNextResponse<typeof GET_17>
      query: ExtractNextQuery<typeof GET_17>
      params: ExtractNextParams<typeof GET_17>
    },
  };
  'conversations/[id]/messages': {
    POST: {
      body: ExtractNextBody<typeof POST_18>
      response: ExtractNextResponse<typeof POST_18>
      query: ExtractNextQuery<typeof POST_18>
      params: ExtractNextParams<typeof POST_18>
    },
  };
  'conversations/[id]': {
    GET: {
      response: ExtractNextResponse<typeof GET_19>
      query: ExtractNextQuery<typeof GET_19>
      params: ExtractNextParams<typeof GET_19>
    },
  };
  'conversations': {
    GET: {
      response: ExtractNextResponse<typeof GET_20>
      query: ExtractNextQuery<typeof GET_20>
      params: ExtractNextParams<typeof GET_20>
    },
    POST: {
      body: ExtractNextBody<typeof POST_20>
      response: ExtractNextResponse<typeof POST_20>
      query: ExtractNextQuery<typeof POST_20>
      params: ExtractNextParams<typeof POST_20>
    },
  };
  'conversations/unread': {
    GET: {
      response: ExtractNextResponse<typeof GET_21>
      query: ExtractNextQuery<typeof GET_21>
      params: ExtractNextParams<typeof GET_21>
    },
  };
  'listings/[id]/favorite': {
    POST: {
      body: ExtractNextBody<typeof POST_22>
      response: ExtractNextResponse<typeof POST_22>
      query: ExtractNextQuery<typeof POST_22>
      params: ExtractNextParams<typeof POST_22>
    },
  };
  'listings/[id]/images': {
    POST: {
      body: ExtractNextBody<typeof POST_23>
      response: ExtractNextResponse<typeof POST_23>
      query: ExtractNextQuery<typeof POST_23>
      params: ExtractNextParams<typeof POST_23>
    },
    PUT: {
      body: ExtractNextBody<typeof PUT_23>
      response: ExtractNextResponse<typeof PUT_23>
      query: ExtractNextQuery<typeof PUT_23>
      params: ExtractNextParams<typeof PUT_23>
    },
    DELETE: {
      response: ExtractNextResponse<typeof DELETE_23>
      query: ExtractNextQuery<typeof DELETE_23>
      params: ExtractNextParams<typeof DELETE_23>
    },
  };
  'listings/[id]': {
    GET: {
      response: ExtractNextResponse<typeof GET_24>
      query: ExtractNextQuery<typeof GET_24>
      params: ExtractNextParams<typeof GET_24>
    },
    PUT: {
      body: ExtractNextBody<typeof PUT_24>
      response: ExtractNextResponse<typeof PUT_24>
      query: ExtractNextQuery<typeof PUT_24>
      params: ExtractNextParams<typeof PUT_24>
    },
    DELETE: {
      response: ExtractNextResponse<typeof DELETE_24>
      query: ExtractNextQuery<typeof DELETE_24>
      params: ExtractNextParams<typeof DELETE_24>
    },
  };
  'listings': {
    POST: {
      body: ExtractNextBody<typeof POST_25>
      response: ExtractNextResponse<typeof POST_25>
      query: ExtractNextQuery<typeof POST_25>
      params: ExtractNextParams<typeof POST_25>
    },
    GET: {
      response: ExtractNextResponse<typeof GET_25>
      query: ExtractNextQuery<typeof GET_25>
      params: ExtractNextParams<typeof GET_25>
    },
  };
  'user/favorites': {
    GET: {
      response: ExtractNextResponse<typeof GET_26>
      query: ExtractNextQuery<typeof GET_26>
      params: ExtractNextParams<typeof GET_26>
    },
  };
  'user/profile': {
    GET: {
      response: ExtractNextResponse<typeof GET_27>
      query: ExtractNextQuery<typeof GET_27>
      params: ExtractNextParams<typeof GET_27>
    },
    PUT: {
      body: ExtractNextBody<typeof PUT_27>
      response: ExtractNextResponse<typeof PUT_27>
      query: ExtractNextQuery<typeof PUT_27>
      params: ExtractNextParams<typeof PUT_27>
    },
  };
  'users/heartbeat': {
    POST: {
      body: ExtractNextBody<typeof POST_28>
      response: ExtractNextResponse<typeof POST_28>
      query: ExtractNextQuery<typeof POST_28>
      params: ExtractNextParams<typeof POST_28>
    },
  };
};
