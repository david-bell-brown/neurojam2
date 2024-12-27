import "./App.css";
import { trpc } from "./utils/trpc";
import { useAtom } from "jotai";

const greetingAtom = trpc.greeting.hello.atomWithQuery({ name: "world" });
const numberAtom = trpc.post.randomNumber.atomWithSubscription();

function App() {
  const [greeting] = useAtom(greetingAtom);
  const [randy] = useAtom(numberAtom);

  return (
    <div>
      <div>{greeting}</div>
      <div>{randy.randomNumber}</div>
    </div>
  );
}

export default App;
