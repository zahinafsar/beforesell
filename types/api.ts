import type { ExtractNextBody, ExtractNextQuery, ExtractNextResponse, ExtractNextParams } from 'next-ts-api';
import type { POST as POST_1 } from '../app/api/auth/forgot-password/route';
import type { POST as POST_2 } from '../app/api/auth/login/route';
import type { POST as POST_3 } from '../app/api/auth/logout/route';
import type { GET as GET_4 } from '../app/api/auth/me/route';
import type { POST as POST_5 } from '../app/api/auth/register/route';
import type { POST as POST_6 } from '../app/api/auth/reset-password/route';
import type { POST as POST_7 } from '../app/api/auth/verify-email/route';
import type { GET as GET_8 } from '../app/api/categories/[id]/attributes/route';
import type { POST as POST_9 } from '../app/api/conversations/[id]/messages/route';
import type { GET as GET_10 } from '../app/api/conversations/[id]/route';
import type { GET as GET_11, POST as POST_11 } from '../app/api/conversations/route';
import type { GET as GET_12 } from '../app/api/conversations/unread/route';
import type { POST as POST_13 } from '../app/api/listings/[id]/favorite/route';
import type { POST as POST_14, PUT as PUT_14, DELETE as DELETE_14 } from '../app/api/listings/[id]/images/route';
import type { GET as GET_15, PUT as PUT_15, DELETE as DELETE_15 } from '../app/api/listings/[id]/route';
import type { POST as POST_16, GET as GET_16 } from '../app/api/listings/route';
import type { GET as GET_17 } from '../app/api/user/favorites/route';
import type { GET as GET_18, PUT as PUT_18 } from '../app/api/user/profile/route';
import type { POST as POST_19 } from '../app/api/users/heartbeat/route';

export type ApiRoutes = {
  'auth/forgot-password': {
    POST: {
      body: ExtractNextBody<typeof POST_1>
      response: ExtractNextResponse<typeof POST_1>
      query: ExtractNextQuery<typeof POST_1>
      params: ExtractNextParams<typeof POST_1>
    },
  };
  'auth/login': {
    POST: {
      body: ExtractNextBody<typeof POST_2>
      response: ExtractNextResponse<typeof POST_2>
      query: ExtractNextQuery<typeof POST_2>
      params: ExtractNextParams<typeof POST_2>
    },
  };
  'auth/logout': {
    POST: {
      body: ExtractNextBody<typeof POST_3>
      response: ExtractNextResponse<typeof POST_3>
      query: ExtractNextQuery<typeof POST_3>
      params: ExtractNextParams<typeof POST_3>
    },
  };
  'auth/me': {
    GET: {
      response: ExtractNextResponse<typeof GET_4>
      query: ExtractNextQuery<typeof GET_4>
      params: ExtractNextParams<typeof GET_4>
    },
  };
  'auth/register': {
    POST: {
      body: ExtractNextBody<typeof POST_5>
      response: ExtractNextResponse<typeof POST_5>
      query: ExtractNextQuery<typeof POST_5>
      params: ExtractNextParams<typeof POST_5>
    },
  };
  'auth/reset-password': {
    POST: {
      body: ExtractNextBody<typeof POST_6>
      response: ExtractNextResponse<typeof POST_6>
      query: ExtractNextQuery<typeof POST_6>
      params: ExtractNextParams<typeof POST_6>
    },
  };
  'auth/verify-email': {
    POST: {
      body: ExtractNextBody<typeof POST_7>
      response: ExtractNextResponse<typeof POST_7>
      query: ExtractNextQuery<typeof POST_7>
      params: ExtractNextParams<typeof POST_7>
    },
  };
  'categories/[id]/attributes': {
    GET: {
      response: ExtractNextResponse<typeof GET_8>
      query: ExtractNextQuery<typeof GET_8>
      params: ExtractNextParams<typeof GET_8>
    },
  };
  'conversations/[id]/messages': {
    POST: {
      body: ExtractNextBody<typeof POST_9>
      response: ExtractNextResponse<typeof POST_9>
      query: ExtractNextQuery<typeof POST_9>
      params: ExtractNextParams<typeof POST_9>
    },
  };
  'conversations/[id]': {
    GET: {
      response: ExtractNextResponse<typeof GET_10>
      query: ExtractNextQuery<typeof GET_10>
      params: ExtractNextParams<typeof GET_10>
    },
  };
  'conversations': {
    GET: {
      response: ExtractNextResponse<typeof GET_11>
      query: ExtractNextQuery<typeof GET_11>
      params: ExtractNextParams<typeof GET_11>
    },
    POST: {
      body: ExtractNextBody<typeof POST_11>
      response: ExtractNextResponse<typeof POST_11>
      query: ExtractNextQuery<typeof POST_11>
      params: ExtractNextParams<typeof POST_11>
    },
  };
  'conversations/unread': {
    GET: {
      response: ExtractNextResponse<typeof GET_12>
      query: ExtractNextQuery<typeof GET_12>
      params: ExtractNextParams<typeof GET_12>
    },
  };
  'listings/[id]/favorite': {
    POST: {
      body: ExtractNextBody<typeof POST_13>
      response: ExtractNextResponse<typeof POST_13>
      query: ExtractNextQuery<typeof POST_13>
      params: ExtractNextParams<typeof POST_13>
    },
  };
  'listings/[id]/images': {
    POST: {
      body: ExtractNextBody<typeof POST_14>
      response: ExtractNextResponse<typeof POST_14>
      query: ExtractNextQuery<typeof POST_14>
      params: ExtractNextParams<typeof POST_14>
    },
    PUT: {
      body: ExtractNextBody<typeof PUT_14>
      response: ExtractNextResponse<typeof PUT_14>
      query: ExtractNextQuery<typeof PUT_14>
      params: ExtractNextParams<typeof PUT_14>
    },
    DELETE: {
      response: ExtractNextResponse<typeof DELETE_14>
      query: ExtractNextQuery<typeof DELETE_14>
      params: ExtractNextParams<typeof DELETE_14>
    },
  };
  'listings/[id]': {
    GET: {
      response: ExtractNextResponse<typeof GET_15>
      query: ExtractNextQuery<typeof GET_15>
      params: ExtractNextParams<typeof GET_15>
    },
    PUT: {
      body: ExtractNextBody<typeof PUT_15>
      response: ExtractNextResponse<typeof PUT_15>
      query: ExtractNextQuery<typeof PUT_15>
      params: ExtractNextParams<typeof PUT_15>
    },
    DELETE: {
      response: ExtractNextResponse<typeof DELETE_15>
      query: ExtractNextQuery<typeof DELETE_15>
      params: ExtractNextParams<typeof DELETE_15>
    },
  };
  'listings': {
    POST: {
      body: ExtractNextBody<typeof POST_16>
      response: ExtractNextResponse<typeof POST_16>
      query: ExtractNextQuery<typeof POST_16>
      params: ExtractNextParams<typeof POST_16>
    },
    GET: {
      response: ExtractNextResponse<typeof GET_16>
      query: ExtractNextQuery<typeof GET_16>
      params: ExtractNextParams<typeof GET_16>
    },
  };
  'user/favorites': {
    GET: {
      response: ExtractNextResponse<typeof GET_17>
      query: ExtractNextQuery<typeof GET_17>
      params: ExtractNextParams<typeof GET_17>
    },
  };
  'user/profile': {
    GET: {
      response: ExtractNextResponse<typeof GET_18>
      query: ExtractNextQuery<typeof GET_18>
      params: ExtractNextParams<typeof GET_18>
    },
    PUT: {
      body: ExtractNextBody<typeof PUT_18>
      response: ExtractNextResponse<typeof PUT_18>
      query: ExtractNextQuery<typeof PUT_18>
      params: ExtractNextParams<typeof PUT_18>
    },
  };
  'users/heartbeat': {
    POST: {
      body: ExtractNextBody<typeof POST_19>
      response: ExtractNextResponse<typeof POST_19>
      query: ExtractNextQuery<typeof POST_19>
      params: ExtractNextParams<typeof POST_19>
    },
  };
};
