/**
 * @public
 */
export interface ISubscription {
  isSubscribed: boolean;
  tags: Array<string>;
  lastUpdatedSubscriptionState?: string;
  doubleOptIn?: {
    emailSentTime: string;
    confirmTime: string;
    status: 'Pending' | 'NotConfirmed' | 'Confirmed';
  };
}
