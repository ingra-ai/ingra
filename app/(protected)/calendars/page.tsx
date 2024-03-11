
import { GoogleButtonUI } from "./GoogleButtonUI";

export default async function Calendar() {

  return (
    <div className="leading-7">
      <p> Coming soon </p>
      <GoogleButtonUI 
        type="redirect"
        text="Google Calendar Connect" 
      />
    </div>
  );
}
