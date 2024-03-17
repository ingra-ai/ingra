import { GoogleButtonUI } from './GoogleButtonUI';

export default async function Calendar() {
  return (
    <div className="leading-7">
      <p> Coming soon </p>
      <p>
        {' '}
        You can always remove your access at{' '}
        <a href="https://myaccount.google.com/connections" target="_blank">
          https://myaccount.google.com/connections
        </a>{' '}
      </p>
      <GoogleButtonUI type="redirect" text="Google Calendar Connect" />
    </div>
  );
}
