import { MIXPANEL_TOKEN } from '@lib/constants';
import Mixpanel from 'mixpanel';

export const mixpanel = Mixpanel.init(MIXPANEL_TOKEN);