import { useState } from "react";
import "./App.css";
import { trpc } from "./utils/trpc";

function App() {
  const [randomNumber, setRandomNumber] = useState(0);
  const greetingQuery = trpc.greeting.hello.useQuery({ name: "world" });
  const randomNumberResult = trpc.post.randomNumber.useSubscription(undefined, {
    onData: num => {
      setRandomNumber(num.randomNumber);
    },
  });

  return (
    <div>
      <div>{greetingQuery.data}</div>
      <div>Random number: {randomNumber}</div>
    </div>
  );
}

export default App;
