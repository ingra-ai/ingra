import { IS_PROD, MIXPANEL_TOKEN } from '../constants';
import Mixpanel from 'mixpanel';

export const mixpanel = MIXPANEL_TOKEN
  ? Mixpanel.init(MIXPANEL_TOKEN)
  : {
      track: () => void 0,
    };
