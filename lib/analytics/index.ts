import { IS_PROD, MIXPANEL_TOKEN } from '@lib/constants';
import Mixpanel from 'mixpanel';

export const mixpanel = IS_PROD ? Mixpanel.init(MIXPANEL_TOKEN) : {
  track: () => void 0
};